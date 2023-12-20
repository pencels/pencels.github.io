---
layout: post
title: The Rabbit Hole of Typecasting
tags: ["pl"]
---

I've been trying to get back into old passion projects that have fallen by the wayside. One of these is [Crust](https://github.com/pencels/crust), my attempt at writing a simple C-like language that uses the [LLVM compiler infrastructure](https://llvm.org/). Since it's been so long since I touched it, I decided to gut most of the internals and start over from scratch (I had to update to LLVM 15 anyway, so might as well).

I was chugging along with my code, emitting [LLVM IR](https://llvm.org/docs/LangRef.html#introduction) for strings, variables, structs, etc. Things were going great. It was all going smoothly until I got to the part where I need to emit typecasts. What seemed like a simple thing threw me down a rabbit hole which I'm still working my way out of :smile:.

In this post, I'll try to explain my thought process for a lot of this journey, but I'll also try to keep it educational as well. Buckle up, everyone.

## Values and Types

In every language, there is a notion of **values** and **types**. Values are the things you do computations with, and types help categorize those values into neat little boxes.

For example:

- `42` is a numerical value with type `int` (short for "integer")
- `3.14` is a numerical value with type `float` (short for "floating point")
- `'w'` is a text value with type `char` (short for "character")
- `"hello"` is a text value with type `*char` (multiple characters, a.k.a. "string")

Operations are well-defined between certain types. For example, we know what it means to add `1` and `2.5`, because we know how addition (`+`) works between `int` and `float`:

```rust
1 + 2.5 == 3.5
```

We also know what it means to "add" two strings together (a.k.a. [concatenation](https://en.wikipedia.org/wiki/Concatenation)):

```rust
"blue" + "berry" == "blueberry"
"12" + "34" == "1234"
```

However, some types don't "work" together, or at least it isn't obvious how they would. For example, what does it mean to add an `int` and a string type?

```rust
42 + "1" == ?
```

What happens here depends on the programming language. Here are what some languages do, along with the reasoning behind them.

**Interpret the string as an `int`, then do addition.** These languages say:

> `+` is made for numbers. This string thing `"1"` \*looks like\* a number, so we'll treat it like an `int` for this operation. The answer is `42 + 1 == 43`.

**Interpret the `int` as a string, then do concatenation.**

> Any time we're "adding" a string, we assume the user wants string concatenation. We'll treat the `42` as a string for this operation. The answer is `"42" + "1" == "421"`.

**Throw an error**.

> Text and numbers are different things, so it's meaningless to "add" them. It's better for the user to edit the code to indicate which kind of "add" they mean here.

The first two options perform **implicit** type conversion. These type conversions work off assumptions and don't involve any input from the user to occur.

The last option requires the user to do an **explicit** type conversion, typically by writing an extra bit of code to handle the type mismatch. Languages take different approaches here, but we could specify the difference with something along the lines of:

```python
str(42) + "1" # becomes "421"
42 + int("1") # becomes 43
```

This form of explicit type conversion is called a _cast expression_, and it's what this post focuses on.

## Casts

A **cast** is a basic operation which converts a value from its original type to a target type, typically using a special type of syntax.

For example, we may want to convert an `int` value to the `float` type. This is a common thing to do, since `float` values work more like real numbers with a fractional part, and that behavior is helpful for a lot of real world problems. In fact, this is such a common conversion that most compilers will do it implicitly where applicable.

In Crust, casting to the `float` type would look like this:

```rust
42 as float
```

The `as` keyword is our cast operator: we place the value we want to cast on the left, and we place the target type on the right.

Okay, so what's the big deal? This seems pretty straightforward. We write `as float` and now we can do our math.

Well, remember we are the ones _designing_ the language. We're responsible for coding what happens in the `as` keyword, under the hood.

It turns out there's actually quite a bit to it. To understand what needs to happen, let's take a look at what `int` and `float` even mean.

## Whatever floats your boat

I'll let you in on a secret: everything on your computer is stored in binary. That means we only use a combination of bits (1s and 0s) to represent any value.

This poses an interesting problem: how do we represent decimal numbers in binary? We can't use the symbols 2 through 9, or a decimal point, since our computer doesn't even know those exist.

Our computer engineering elders had to do a lot of thinking about this. Thankfully, their work led to some of the most prevalent schemes in use today: [2's complement](https://en.wikipedia.org/wiki/Two%27s_complement) and [IEEE-754 floating point](https://en.wikipedia.org/wiki/IEEE_754).

These schemes lay out 1s and 0s in a clever way to represent a large collection of numbers. I won't go into the specifics of each scheme here, but the key takeaway is:

- we use plain 2's complement to store `int` values.
- we use IEEE-754 floating point to store `float` values.

We assign a different scheme for each type because each one is tailored to a different circuit in your computer. 2's complement works better with your ALU (Arithmetic Logic Unit), while IEEE-754 is tailored for your FPU (Floating Point Unit).

Using the wrong scheme can be detrimental. Trying to use 2's complement to handle fractional values (e.g. fixed-point) can be very restrictive. Using IEEE-754 to hold integer values, though possible, can actually lead to imprecision in calculations if all you need are integer values. These are some specific cons, but the point stands: each scheme has their place.

### So what's the difference?

Great, we have two schemes to use. So what? To make this distinction a bit more concrete, let's work through an example.

For simplicity, let's assume we're on a 16-bit system. This means we have 16 bits to work with to represent a number. We'll represent those bits as 16 cells like so:

<style>
    div.cells + table, .cells {
        text-align: center;
        margin-left: auto;
        margin-right: auto;
        max-width: 100%;
        overflow-x: auto;
        font-family: 'Fira Code', monospace;
    }

    .cells.copy {
        font-size: .8rem;
    }

    @media (min-width: 576px) {
        .cells.copy {
            font-size: 1rem;
        }
    }

    table tr {
        border-bottom: none;
    }

    div.cells + table td, .cells td {
        background: #0d1117;
        padding: .2rem .2rem;
        border: 1px solid hsl(162, 5%, 25%);
    }

    div.cells.empty + table, table.cells.empty {
        color: transparent;
    }

    table.cells {
        border: none;
    }

    tr.blank, tr.blank td, td.blank {
        border: none;
        background: transparent;
    }

    td.bad {
        color: #a61212;
    }

    tr.update, td.update {
        color: #f9d568;
    }

    tr.caption, tr.caption td.caption {
        font-size: .8rem;
        border: none;
        background: transparent;
    }
</style>

<div class="cells empty"></div>

|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|

Let's fill in the cells see what the integer `42` looks like in 2's complement:

<table class="cells mb-2">
<tbody>
    <tr>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
    </tr>
    <tr class="caption">
        <td colspan="16" class="caption">2's complement</td>
    </tr>
</tbody>
</table>

And here's what the floating point `42.0` looks like in IEEE-754:

<table class="cells mb-2">
<tbody>
    <tr>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
    </tr>
    <tr class="caption">
        <td colspan="16" class="caption">IEEE-754</td>
    </tr>
</tbody>
</table>

See how they're not the same pattern? The bit-level representations are different, even though they represent the same number conceptually, 42!

<!-- <table class="cells copy">
<tbody>
    <tr>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
    </tr>
    <tr class="blank">
        <td colspan="4">⇣</td>
        <td colspan="8">copy</td>
        <td colspan="4">⇣</td>
    </tr>
    <tr>
        <td>0</td>
        <td class="bad">1</td>
        <td>0</td>
        <td class="bad">1</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td class="bad">1</td>
        <td>0</td>
        <td class="bad">1</td>
        <td class="bad">0</td>
        <td>0</td>
        <td class="bad">0</td>
        <td>0</td>
        <td class="bad">0</td>
        <td>0</td>
    </tr>
</tbody>
</table> -->

The difference in bit patterns means that our cast (the `as` keyword) can't just copy the bits directly --- the patterns are fundamentally different. If we use the 2's complement bits directly, we'd be representing the IEEE-754 floating point value `0.00000251` instead:

<table class="cells copy mb-2">
<tbody>
    <tr>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td class="blank">&nbsp;= 42&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
    </tr>
    <tr class="caption">
        <td colspan="16" class="caption">2's complement</td>
    </tr>
</tbody>
</table>

<table class="cells copy mb-2">
<tbody>
    <tr>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td class="blank">&nbsp;= 0.00000251</td>
    </tr>
    <tr class="caption">
        <td colspan="16" class="caption">IEEE-754</td>
    </tr>
</tbody>
</table>

Imagine you're using Crust, and want to write some floating point math, and you get some weird result:

```rust
let x = 42 as float;
output(x + 27.0); // outputs 27.00000251!
```

You might think, "What happened to my 42? Where is this random .000000251 coming from?"

This is clearly not what we're looking for.

So, what do we do? Well, as Crust's language designers, we could write our own bit-fiddling function which handles this conversion properly, call it `i2f()`. We'd then insert a call to `i2f()` every time an `int as float` cast pops up in the user's program.

Another thing we could do is take advantage of the computer hardware. CPU architectures ship with special floating-point instructions to do this bit-level conversion quickly: `cvtsi2ss` for x86, `fsito` for ARM, `fitos` for SPARC, etc. Just insert that instruction et voilà, cast done.

Whatever we decide, there needs to be something, not just a direct copy operation, which handles the conversion:

<table class="cells">
<tbody>
    <tr class="caption">
        <td colspan="16" class="caption">2's complement</td>
    </tr>
    <tr>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
    </tr>
    <tr class="blank">
        <td colspan="16">↓</td>
    </tr>
    <tr class="conv">
        <td colspan="16">i2f()/cvtsi2ss/fsito/fitos</td>
    </tr>
    <tr class="blank">
        <td colspan="16">↓</td>
    </tr>
    <tr>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
    </tr>
    <tr class="caption">
        <td colspan="16" class="caption">IEEE-754</td>
    </tr>
</tbody>
</table>

In my case, I'm outputting LLVM IR, so I'd want an LLVM instruction that does this. Luckily, there's an instruction called `sitofp` which fulfills this [exact purpose!](https://llvm.org/docs/LangRef.html#sitofp-to-instruction) Here's how we'd use it:

```llvm
sitofp i32 42 to float  ; 42 as float
```

Phew, so we found the right way to cast integers to floats. We can use a similar instruction to handle the other direction as well (i.e. `fptosi`). Easy :ok:.

## What about other types?

If the only types we needed were `int` and `float`, we'd be done here. But any programming language worth its salt has many more types: characters, strings, arrays, pointers, user-defined types, etc. How do we handle other possible casts?

### Characters

First, let's look at characters (type `char`). This type represents symbols we use to write text. For example, the letters of the alphabet or punctuation.

Characters have the same problem that integers and floats had:

- How do we represent the letter `'A'` in binary?
- What about the dollar sign `'$'`?
- What about `'5'`? (this is the symbol `'5'`, not to be confused with the integer `5`)

Similar to 2's complement and IEEE-754 from earlier, our ancestors bestowed us with character encoding standards:

- [ASCII](https://en.wikipedia.org/wiki/ASCII): the "American Standard Code for Information Interchange," an 8-bit scheme which was designed to represent characters used mainly in American English.
- [Unicode](https://en.wikipedia.org/wiki/Unicode): a variable-length scheme which aims to support any and all writing systems. If you've ever used emoji before, you've used Unicode 😀.

Since Crust is a rudimentary C clone, I won't go through the trouble of supporting Unicode, at least not right now. I'll make my `char` type an 8-bit type which uses the ASCII encoding:

<table class="cells mb-2">
<tbody>
    <tr>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td class="blank">&nbsp;= 'A'</td>
    </tr>
</tbody>
</table>

<table class="cells mb-2">
<tbody>
    <tr>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td class="blank">&nbsp;= '$'</td>
    </tr>
</tbody>
</table>

<table class="cells mb-2">
<tbody>
    <tr>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>1</td>
        <td class="blank">&nbsp;= '5'</td>
    </tr>
    <tr class="caption">
        <td colspan="8" class="caption">ASCII</td>
    </tr>
</tbody>
</table>

You might see where this is going. What happens when we try to cast a `char` to `int`?

```rust
'A' as int
```

Let's consider the bit patterns like before. A cast from `char` to `int` would mean mapping our 8-bit pattern to a 16-bit pattern.

<table class="cells">
<tbody>
    <tr class="caption">
        <td colspan="16" class="caption">ASCII</td>
    </tr>
    <tr>
        <td colspan="4" class="blank"></td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td colspan="4" class="blank"></td>
    </tr>
    <tr class="blank">
        <td colspan="16">↓</td>
    </tr>
    <tr class="conv">
        <td colspan="5" class="blank"></td>
        <td colspan="6">?</td>
        <td colspan="5" class="blank"></td>
    </tr>
    <tr class="blank">
        <td colspan="16">↓</td>
    </tr>
    <tr>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
    </tr>
    <tr class="caption">
        <td colspan="16" class="caption">2's complement</td>
    </tr>
</tbody>
</table>

What C does[^1] here is copy the 8 bits over, right-justified, and fill in the rest of the bits with 0s. We'll try to copy this behavior in Crust. This is called a "zero-extend" operation, and LLVM supplies the `zext` instruction [to do this](https://llvm.org/docs/LangRef.html#zext-to-instruction).

<table class="cells">
<tbody>
    <tr class="caption">
        <td colspan="16" class="caption">ASCII</td>
    </tr>
    <tr>
        <td colspan="4" class="blank"></td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td colspan="4" class="blank"></td>
    </tr>
    <tr class="blank">
        <td colspan="16">↓</td>
    </tr>
    <tr class="conv update">
        <td colspan="5" class="blank"></td>
        <td colspan="6">zext</td>
        <td colspan="5" class="blank"></td>
    </tr>
    <tr class="blank">
        <td colspan="16">↓</td>
    </tr>
    <tr class="update">
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
    </tr>
    <tr class="caption">
        <td colspan="16" class="caption">2's complement</td>
    </tr>
</tbody>
</table>

Here's how we would write the LLVM instruction to do this cast for Crust:

```llvm
zext i8 u0x41 to i32  ; 'A' as int
```

The `i8 u0x41` represents the ASCII bit pattern for `'A'` we show above.

Cool! Things are going pretty smoothly so far.

### Widening and Narrowing

What we just did with the zero-extension is **widen** the type. `char`'s 8 bits can only represent so many values, but `int`'s 32 bits can represent way more, including those represented by `char`.

If we want to go the other way around (`int` to `char`), we have to **narrow** the type. This typically can involve a loss of information, since by [the pigeonhole principle](https://en.wikipedia.org/wiki/Pigeonhole_principle), we can't fit all the bits into our target type.

<table class="cells">
<tbody>
    <tr class="caption">
        <td colspan="16" class="caption">a lot o' bits</td>
    </tr>
    <tr>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
    </tr>
    <tr class="blank">
        <td colspan="16">↓</td>
    </tr>
    <tr>
        <td colspan="4" class="blank"></td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td>?</td>
        <td colspan="4" class="blank"></td>
    </tr>
    <tr class="caption">
        <td colspan="16" class="caption">...not enough room</td>
    </tr>
</tbody>
</table>

We'll use C as an example again here. To fit the bits into our target type, we can chop off bits from the left.

Thinking about it another way, we kind of want the opposite of zero-extension, which adds zeroes to the left-hand side. It makes sense that to go in the other direction, we'd remove bits from the left.

This operation is called **truncation** or `trunc` in LLVM. To reiterate, it's sort of the dual operation to `zext`, since it narrows a type whereas `zext` widens a type.

<table class="cells">
<tbody>
    <tr class="caption">
        <td colspan="16" class="caption">2's complement</td>
    </tr>
    <tr>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
    </tr>
    <tr class="blank">
        <td colspan="16">↓</td>
    </tr>
    <tr class="conv update">
        <td colspan="5" class="blank"></td>
        <td colspan="6">trunc</td>
        <td colspan="5" class="blank"></td>
    </tr>
    <tr class="blank">
        <td colspan="16">↓</td>
    </tr>
    <tr class="update">
        <td colspan="4" class="blank"></td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
        <td colspan="4" class="blank"></td>
    </tr>
    <tr class="caption">
        <td colspan="16" class="caption">ASCII</td>
    </tr>
</tbody>
</table>

It turns out that this bit pattern represents the ASCII encoding of an ampersand:

<table class="cells mb-2">
<tbody>
    <tr>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
        <td class="blank">&nbsp;= '&'</td>
    </tr>
    <tr class="caption">
        <td colspan="8" class="caption">ASCII</td>
    </tr>
</tbody>
</table>

The original bit pattern is the 2's complement of the integer `-218`, so my LLVM would end up looking like:

```llvm
trunc i32 -218 to i8  ; -218 as char
```

Neat! :peepoCheer:

### Transmuting and Converting

Okay, so we figured out how to widen and narrow between the `char` and `int` types by using zero-extension and truncation on their bit patterns. Awesome.

Something may not seem satisfying here though. By doing this, we have fundamentally changed the interpretation of each source value. We literally _just_ changed the number -218 into the ampersand symbol (&). Side by side, these have zero obvious relationship to each other. Why even do this?

What we did here goes by a few names, but I'll go with "transmuting". In Rust, this word has a pretty strict definition, but I'll use a softer version of it in this post.

I call a cast **transmuting** when it reads the source value's bit pattern as-is, but uses the target type's interpretation of it. If the target type needs more/fewer bits, then those are implied by some bit extension/truncation as necessary. This is useful for doing low-level dark magic, sometimes for cutting corners or bootstrapping new language features. As with all forms of dark magic, misusing transmutes can lead to [Bad Things](https://en.wikipedia.org/wiki/Undefined_behavior) happening.

I see this as different from **converting**, which is a cast that seeks to retain the same _conceptual_ value as the source value, where the bit pattern may change during this process. Converting looks like taking the integer `42` and converting it to floating point `42.0`. The same conceptual value, but with a different bit pattern underneath. These casts are useful in high-level programming where you abstract away all the details of the machine underneath and only focus on logic necessary for the program to work.

Sometimes, converting **_is_** transmuting. Trivially, if you cast from a type to itself, you preserve the conceptual value _and_ the bit pattern (e.g. 42 is 42 is 42).

This distinction is important enough that languages may even have different cast operators to handle these different types of casts. C, being the wild west, lets you transmute as part of normal cast syntax. C++ tried to make this more explicit with special cast operators[^2] (e.g. [`reinterpret_cast`](https://en.cppreference.com/w/cpp/language/reinterpret_cast)) and even lets you override casts with custom behavior. Rust hides transmutes behind an unsafe library function ([`mem::transmute`](https://doc.rust-lang.org/std/mem/fn.transmute.html)). The trend is that newer and higher-level languages deal mainly in conversions and rarely let you do transmutes, since transmuting is not intuitive and quite error-prone.

## That's it for now

I was originally going to put a whole extra section on pointer/slice types and casting, but this post is already long enough. I'll make a follow up for it later. Pointer types in Crust are another pandora's box where things get way more involved than the primitive types we've been dealing with here. :smile:

Thanks for reading.

## Resources

- [IEEE-754 Floating Point Converter](https://www.h-schmidt.net/FloatConverter/IEEE754.html) - A simple converter for floating point numbers.
- [IEEE Standard 754 Floating Point Numbers](https://steve.hollasch.net/cgindex/coding/ieeefloat.html) - A blog post that goes in-depth on the IEEE-754 Floating Point standard. I loved reading it.
- [Float Toy](https://evanw.github.io/float-toy/) - A simple site to play around with different precision floating point representations.
- [The Rust Reference: Type cast expressions](https://doc.rust-lang.org/reference/expressions/operator-expr.html#type-cast-expressions) - Very detailed specification of how Rust handles cast expressions.

## Footnotes

[^1]: Technically it is implementation dependent: C either performs a zero extension or sign extension depending on whether the `char` type is unsigned or signed by default. In Crust, `char` is unsigned by default, so I chose to word it this way since it would make for a shorter explanation.
[^2]: C++ is ever-changing --- at the time of writing, I was only aware of `reinterpret_cast` and friends, but apparently there's also [`std::bit_cast`](https://en.cppreference.com/w/cpp/numeric/bit_cast) and probably many more. Point is, language users/designers obviously care about the difference, and that leads to a lot of nuance on this topic :\)
