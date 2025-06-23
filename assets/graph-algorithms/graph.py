class Graph:
    def __init__(self, nodes, edges):
        self.adj = {}

        for node in nodes:
            self.adj[node] = set()

        for (start, end) in edges:
            self.adj[start].add(end)

    def dfs(self, node, visit, visited=None):
        if visited is None:
            visited = set()

        visit(node)
        visited.add(node)

        for neighbor in self.adj[node]:
            if neighbor not in visited:
                self.dfs(neighbor, visit, visited)

    def dfs_iterative(self, node, visit, visited=None):
        if visited is None:
            visited = set()

        stack = [node]
        while stack:
            node = stack.pop()

            visit(node)
            visited.add(node)

            for neighbor in self.adj[node]:
                if neighbor not in visited:
                    stack.append(neighbor)

    def bfs(self, node, visit, visited=None):
        if visited is None:
            visited = set()

        queue = [node]
        while queue:
            front = queue.pop(0)

            visit(front)
            visited.add(node)

            for neighbor in self.adj[node]:
                if neighbor not in visited:
                    queue.append(neighbor)

    def has_cycle_helper(self, node, path, visited):
        path.add(node)
        visited.add(node)

        for neighbor in self.adj[node]:
            if neighbor in path:
                return True

            if neighbor not in visited and self.has_cycle_helper(neighbor, path, visited):
                return True

        path.remove(node)
        return False

    def has_cycle(self):
        visited = set()
        path = set()
        for node in self.adj:
            if node not in visited and self.has_cycle_helper(node, path, visited):
                return True
        return False

family = Graph(
    nodes=['granny', 'gramps', 'mom', 'dad', 'me', 'sister'],
    edges=[
        ('granny', 'mom'),
        ('gramps', 'mom'),
        ('mom', 'me'),
        ('dad', 'me'),
        ('mom', 'sister'),
        ('dad', 'sister'),
    ]
)

complex_graph = Graph(
    nodes=['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    edges=[
        ('a', 'b'),
        ('b', 'c'),
        ('c', 'b'),
        ('b', 'd'),
        ('d', 'c'),
        ('f', 'g'),
    ]
)
