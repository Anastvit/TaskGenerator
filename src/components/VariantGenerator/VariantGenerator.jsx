import React, { forwardRef, useImperativeHandle } from 'react';

const VariantGenerator = forwardRef(({ nodes, edges, rootId, onGenerate }, ref) => {
  const generateVariants = () => {
    if (!rootId) return;
    const results = [];
    const seenPaths = new Set();
    const seenStrings = new Set();

    const visit = (path, nodePath, usedStrings) => {
      const currentId = nodePath[nodePath.length - 1];
      const outgoing = edges.filter(e => e.source === currentId);
      const singleEdges = outgoing.filter(e => e.data?.type !== 'multi');
      const multiEdges = outgoing.filter(e => e.data?.type === 'multi');

      if (multiEdges.length > 0) {
        const targets = multiEdges.map(e => e.target);
        const subsets = generateSubsets(targets);
        for (const subset of subsets) {
          const multiArr = subset
            .map(id => renderNodeText(id, usedStrings))
            .filter(Boolean);
          const multiTexts = [...new Set(multiArr)].join(', ');
          visit([...path, multiTexts], [...nodePath, ...subset], new Set(usedStrings));
        }
      }

      if (singleEdges.length === 0 && multiEdges.length === 0) {
        const key = nodePath.join('→');
        const sentence = path.join(' ');
        if (!seenPaths.has(key) && !seenStrings.has(sentence)) {
          seenPaths.add(key);
          seenStrings.add(sentence);
          results.push(sentence);
        }
        return;
      }

      for (const edge of singleEdges) {
        const nextId = edge.target;
        const nextText = renderNodeText(nextId, usedStrings);
        visit([...path, nextText], [...nodePath, nextId], new Set(usedStrings));
      }
    };

    const generateSubsets = arr => {
      const result = [];
      const n = arr.length;
      for (let i = 1; i < 1 << n; i++) {
        const subset = [];
        for (let j = 0; j < n; j++) {
          if (i & (1 << j)) subset.push(arr[j]);
        }
        result.push(subset);
      }
      return result;
    };

    const renderNodeText = (nodeId, usedStrings) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return '';
      const { type, data } = node;
      const custom = data?.custom || {};

      if (type === 'element') {
        return data.label || '';
      }

      if (type === 'variable') {
        const { varType, options = '', useRange, value, range } = custom;

        if (varType === 'string') {
          const opts = options.split(',').map(s => s.trim()).filter(Boolean);
          if (!opts.length) return '';
          const remaining = opts.filter(o => !usedStrings.has(o));
          const choice = remaining.length
            ? remaining[Math.floor(Math.random() * remaining.length)]
            : opts[Math.floor(Math.random() * opts.length)];
          usedStrings.add(choice);
          return choice;
        }

        const val = useRange ? randomBetween(range.min, range.max) : value;
        return String(val);
      }

      if (type === 'array') {
        const { length, mode, values, range } = custom;
        let content = '';
        if (mode === 'manual') {
          content = (values || [])
            .map(v => {
              const trimmed = String(v).trim();
              const asNumber = Number(trimmed);
              if (!isNaN(asNumber) && trimmed !== '') {
                return asNumber;
              } else {
                return trimmed;
              }
            })
            .join(', ');
        } else if (mode === 'range') {
          content = randomArray(length, range.min, range.max).join(', ');
        }
        return `[${content}]`;
      }

      return '';
    };

    const randomBetween = (min, max) => {
      const a = Number(min);
      const b = Number(max);
      return Math.floor(Math.random() * (b - a + 1)) + a;
    };

    const randomArray = (len, min, max) => {
      const length = Number(len);
      return Array.from({ length }, () => randomBetween(min, max));
    };

    const rootText = renderNodeText(rootId, new Set());
    visit([rootText], [rootId], new Set());
    onGenerate(results);
  };

  useImperativeHandle(ref, () => generateVariants);

  return null;
});

export default VariantGenerator;
