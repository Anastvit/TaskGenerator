import React, { useState, useEffect } from 'react';
import styles from './TemplateManager.module.css';

const TemplateManager = ({ nodes, edges, rootId, onLoadTemplate }) => {
  const [theme, setTheme] = useState('');
  const [name, setName] = useState('');
  const [templates, setTemplates] = useState({});
  const [expandedThemes, setExpandedThemes] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('templatesByTheme') || '{}');
    setTemplates(stored);
  }, []);

  const saveTemplate = () => {
    if (!theme || !name) return;

    const all = JSON.parse(localStorage.getItem('templatesByTheme') || '{}');
    const themeGroup = all[theme] || {};
    themeGroup[name] = { nodes, edges, rootId };
    all[theme] = themeGroup;

    localStorage.setItem('templatesByTheme', JSON.stringify(all));
    setTemplates(all);
    setName('');
  };

  const loadTemplate = (themeKey, templateKey) => {
    const stored = JSON.parse(localStorage.getItem('templatesByTheme') || '{}');
    const template = stored?.[themeKey]?.[templateKey];
    if (template) onLoadTemplate(template);
  };

  const toggleTheme = (themeKey) => {
    setExpandedThemes(prev => ({
      ...prev,
      [themeKey]: !prev[themeKey]
    }));
  };

  return (
    <div className={styles.wrapper}>
      <h4>📁 Шаблоны</h4>

      <div className={styles.row}>
        <input
          className={styles.input}
          type="text"
          placeholder="Тема"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
      </div>

      <div className={styles.row}>
        <input
          className={styles.input}
          type="text"
          placeholder="Имя шаблона"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className={styles.button} onClick={saveTemplate}>
          💾
        </button>
      </div>

      <div className={styles.list}>
        {Object.keys(templates).map((themeKey) => (
          <div key={themeKey}>
            <button
              className={styles.themeToggle}
              onClick={() => toggleTheme(themeKey)}
            >
              {expandedThemes[themeKey] ? '▼' : '▶'} {themeKey}
            </button>

            {expandedThemes[themeKey] && (
              <div className={styles.templateGroup}>
                {Object.keys(templates[themeKey]).map((templateKey) => (
                  <button
                    key={templateKey}
                    className={styles.template}
                    onClick={() => loadTemplate(themeKey, templateKey)}
                  >
                    {templateKey}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateManager;
