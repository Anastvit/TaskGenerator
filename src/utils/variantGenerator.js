export function buildGraph(edges) {
  return edges.reduce((acc, { source, target, data }) => {
    const from = String(source);
    const to = String(target);
    const type = data?.type || 'single';
    acc[from] = acc[from] || [];
    acc[from].push({ to, type });
    return acc;
  }, {});
}

export function generateCombinatorialVariants(nodes, edges, rootId) {
  const labelMap = nodes.reduce((acc, node) => {
    acc[String(node.id)] = node.data.label?.trim() || '';
    return acc;
  }, {});

  const graph = buildGraph(edges);
  const results = [];

  function dfs(currentId, path) {
    const children = graph[currentId] || [];
    if (children.length === 0) {
      results.push([...path]);
      return;
    }

    const multi = children.filter((e) => e.type === 'multi');
    const single = children.filter((e) => e.type !== 'multi');

    if (multi.length > 0) {
      const subsets = getNonEmptySubsets(multi);
      subsets.forEach((subset) => {
        const text = subset.map(e => labelMap[e.to]).join(', ');
        const first = subset[0];
        dfs(first.to, [...path, text]);
      });
    }

    if (single.length === 1) {
      const next = single[0];
      dfs(next.to, [...path, labelMap[next.to]]);
    }

    if (single.length > 1) {
      single.forEach((e) => {
        dfs(e.to, [...path, labelMap[e.to]]);
      });
    }
  }

  dfs(String(rootId), [labelMap[String(rootId)]]);
  return results;
}

function getNonEmptySubsets(arr) {
  const result = [];
  const total = 1 << arr.length;
  for (let i = 1; i < total; i++) {
    const subset = [];
    for (let j = 0; j < arr.length; j++) {
      if ((i >> j) & 1) subset.push(arr[j]);
    }
    result.push(subset);
  }
  return result;
}
