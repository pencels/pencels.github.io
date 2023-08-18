# frozen_string_literal: true

require "jekyll"
require "html/pipeline"
require 'net/http'
require 'json'

# frozen_string_literal: true

require 'cgi'

# HTML filter that replaces :emoji: with images.
#
# Context:
#   :asset_root (required) - base url to link to emoji sprite
#   :asset_path (optional) - url path to link to emoji sprite. :file_name can be used as a placeholder for the sprite file name. If no asset_path is set "emoji/:file_name" is used.
#   :ignored_ancestor_tags (optional) - Tags to stop the emojification. Node has matched ancestor HTML tags will not be emojified. Default to pre, code, and tt tags. Extra tags please pass in the form of array, e.g., %w(blockquote summary).
#   :img_attrs (optional) - Attributes for generated img tag. E.g. Pass { "draggble" => true, "height" => nil } to set draggable attribute to "true" and clear height attribute of generated img tag.
class Emoji7TVFilter < HTML::Pipeline::Filter
  ASSET_ROOT = "https://cdn.7tv.app/emote/"
  DEFAULT_IGNORED_ANCESTOR_TAGS = %w[pre code tt].freeze

  class << self
    def emotes
      @emotes ||= load_emotes
    end

    def load_emotes
      emote_set = JSON.parse(Net::HTTP.get(URI('https://7tv.io/v3/emote-sets/644f2c48fcd7cceb148e5005')))
      emote_set['emotes'].to_h {|e| [e['name'], e['data']['host']['url'].rpartition('/').last] }
    end

    def emoji_pattern
      @emoji_pattern ||= /:(#{emotes.keys.map { |name| Regexp.escape(name) }.join("|")}):/
    end
  end

  def call
    doc.search('.//text()').each do |node|
      content = node.text
      next unless content.include?(':')
      next if has_ancestor?(node, ignored_ancestor_tags)
      html = emoji_image_filter(content)
      next if html == content
      node.replace(html)
    end
    doc
  end

  # Implementation of validate hook.
  # Errors should raise exceptions or use an existing validator.
  def validate
  end

  # Replace :emoji: with corresponding images.
  #
  # text - String text to replace :emoji: in.
  #
  # Returns a String with :emoji: replaced with images.
  def emoji_image_filter(text)
    text.gsub(emoji_pattern) do |_match|
      emoji_image_tag(Regexp.last_match(1))
    end
  end

  private

  # Build an emoji image tag
  def emoji_image_tag(name)
    require 'active_support/core_ext/hash/indifferent_access'
    html_attrs =
      default_img_attrs(name)
      .merge!((context[:img_attrs] || {}).with_indifferent_access)
      .map { |attr, value| !value.nil? && %(#{attr}="#{value.respond_to?(:call) && value.call(name) || value}") }
      .reject(&:blank?).join(' '.freeze)

    "<img #{html_attrs}>"
  end

  # Default attributes for img tag
  def default_img_attrs(name)
    {
      'class' => 'emoji'.freeze,
      'title' => ":#{name}:",
      'alt' => ":#{name}:",
      'src' => emoji_url(name).to_s,
    }
  end

  def emoji_url(name)
    File.join(ASSET_ROOT, asset_path(name))
  end

  def emoji_pattern
    self.class.emoji_pattern
  end

  private def asset_path(name)
    File.join(self.class.emotes[name], '2x.webp')
  end

  # Return ancestor tags to stop the emojification.
  #
  # @return [Array<String>] Ancestor tags.
  def ignored_ancestor_tags
    if context[:ignored_ancestor_tags]
      DEFAULT_IGNORED_ANCESTOR_TAGS | context[:ignored_ancestor_tags]
    else
      DEFAULT_IGNORED_ANCESTOR_TAGS
    end
  end
end

module Jekyll
  class Emoji7TV
    BODY_START_TAG = "<body"
    OPENING_BODY_TAG_REGEX = %r!<body(.*?)>\s*!m.freeze

    class << self
      def emojify(doc)
        return unless doc.output&.match?(Emoji7TVFilter.emoji_pattern)

        doc.output = if doc.output.include? BODY_START_TAG
                       replace_document_body(doc)
                     else
                       src = emoji_src(doc.site.config)
                       filter_with_emoji(src).call(doc.output)[:output].to_s
                     end
      end

      # Public: Create or fetch the filter for the given {{src}} asset root.
      #
      # src - the asset root URL (e.g. https://github.githubassets.com/images/icons/)
      #
      # Returns an HTML::Pipeline instance for the given asset root.
      def filter_with_emoji()
        @filter ||= HTML::Pipeline.new([
          Emoji7TVFilter,
        ])
      end

      def emote_set
        @emote_set ||= nil
      end

      # Public: Filters hash where the key is the asset root source.
      # Effectively a cache.
      def filter
        @filter
      end

      # Public: Defines the conditions for a document to be emojiable.
      #
      # doc - the Jekyll::Document or Jekyll::Page
      #
      # Returns true if the doc is written & is HTML.
      def emojiable?(doc)
        (doc.is_a?(Jekyll::Page) || doc.write?) &&
          doc.output_ext == ".html" || doc.permalink&.end_with?("/")
      end

      private

      def replace_document_body(doc)
        head, opener, tail  = doc.output.partition(OPENING_BODY_TAG_REGEX)
        body_content, *rest = tail.partition("</body>")
        processed_markup    = filter_with_emoji.call(body_content)[:output].to_s
        String.new(head) << opener << processed_markup << rest.join
      end
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |doc|
  Jekyll::Emoji7TV.emojify(doc) if Jekyll::Emoji7TV.emojiable?(doc)
end