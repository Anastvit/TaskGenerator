import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = vfsFonts.vfs;

const Sidebar = ({ paths = [], nodes, edges, rootId, onLoadTemplate, onClear }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateTheme, setTemplateTheme] = useState('');
  const [templates, setTemplates] = useState({});
  const [expandedThemes, setExpandedThemes] = useState({});
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        const grouped = {};
        for (const tmpl of data) {
          const theme = tmpl.theme || 'Без темы';
          if (!grouped[theme]) grouped[theme] = [];
          grouped[theme].push(tmpl);
        }
        setTemplates(grouped);
      });
  }, []);

  const saveTemplate = async () => {
    if (!templateName.trim() || !templateTheme.trim() || !nodes.length) return;

    const typeMap = { element: 1, variable: 2, array: 3 };
    const idMap = {};
    let autoId = 1;

    const formattedNodes = nodes.map((n) => {
      const numericId = autoId++;
      idMap[n.id] = numericId;

      return {
        type_id: typeMap[n.type] || 1,
        label: n.data?.label || '',
        custom_json: JSON.stringify({
          ...n.data?.custom,
          position: n.position || { x: 0, y: 0 }
        }),
        is_root: n.id === rootId
      };
    });

    const formattedEdges = edges.map((e) => ({
      prev_id: idMap[e.source],
      next_id: idMap[e.target],
      type_id: e.data?.type === 'multi' ? 2 : 1
    }));

    const payload = {
      name: templateName.trim(),
      theme: templateTheme.trim(),
      nodes: formattedNodes,
      edges: formattedEdges
    };

    const res = await fetch('/api/template/full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setTemplateName('');
      setTemplateTheme('');
      window.location.reload();
    } else {
      const err = await res.text();
      alert('Ошибка при сохранении шаблона');
    }
  };

  const loadTemplate = async (themeKey, tmpl) => {
    try {
      const res = await fetch(`/api/template/${tmpl.id}/full`);
      const data = await res.json();

      const nodeIdMap = {};
      const typedNodes = data.nodes.map((n) => {
        const id = String(n.id);
        nodeIdMap[n.id] = id;

        let parsed = {};
        try {
          parsed = n.custom_json ? JSON.parse(n.custom_json) : {};
        } catch {}

        return {
          id,
          type: ['element', 'variable', 'array'][n.type_id - 1],
          position: parsed.position || { x: 0, y: 0 },
          data: {
            label: n.label,
            custom: parsed,
            onContext: (e, id) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('node-context', { detail: { id, x: e.clientX, y: e.clientY } }));
            }
          }
        };
      });

      const typedEdges = data.edges.map((e) => ({
        id: `${e.prev_id}-${e.next_id}`,
        source: nodeIdMap[e.prev_id],
        target: nodeIdMap[e.next_id],
        data: { type: e.type_id === 2 ? 'multi' : 'single' }
      }));

      const root = String(data.rootId);

      onLoadTemplate({
        nodes: typedNodes,
        edges: typedEdges,
        rootId: root
      });

      setSelectedTemplateId(tmpl.id);
    } catch (err) {
      alert('Не удалось загрузить шаблон');
    }
  };

  const requestDeleteTemplate = (id) => {
    setTemplateToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    await fetch(`/api/templates/${templateToDelete}`, {
      method: 'DELETE'
    });

    setShowDeleteModal(false);
    setTemplateToDelete(null);
    window.location.reload();
  };

  const toggleTheme = (themeKey) => {
    setExpandedThemes(prev => ({
      ...prev,
      [themeKey]: !prev[themeKey]
    }));
  };

  const handleDownloadPDF = () => {
    const allTemplates = Object.values(templates).flat();
    const selectedTemplate = allTemplates.find(t => t.id === selectedTemplateId);
    const selectedTheme = selectedTemplate?.theme || 'Без темы';

    const content = [
      {
        text: `Варианты задач по теме "${selectedTheme}"`,
        style: 'title',
        margin: [0, 0, 0, 20]
      }
    ];

    paths.forEach((text, index) => {
      content.push(
        { text: `Вариант ${index + 1}`, style: 'variantTitle', pageBreak: index !== 0 ? 'before' : undefined },
        { text, style: 'variantText' }
      );
    });

    const docDefinition = {
      content,
      styles: {
        title: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
        variantTitle: { fontSize: 14, bold: true, margin: [0, 0, 0, 8] },
        variantText: { fontSize: 12 }
      },
      pageMargins: [40, 60, 40, 60]
    };

    pdfMake.createPdf(docDefinition).download('задачи.pdf');
  };

  const handleGenerate = () => window.dispatchEvent(new CustomEvent('generate'));

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {!collapsed && (
        <>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Варианты</h4>
            <div className={styles.buttons}>
              <button className={styles.button} onClick={handleDownloadPDF}>PDF</button>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Шаблоны</h4>
            <div className={styles.templateControls}>
              <select
                className={styles.input}
                value={templateTheme}
                onChange={(e) => setTemplateTheme(e.target.value)}
              >
                <option value="">Выберите тему</option>
                {Object.keys(templates).map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>

              <button className={styles.addThemeButton} onClick={() => setShowThemeModal(true)}>
                + Добавить тему
              </button>

              <input
                className={styles.input}
                type="text"
                placeholder="Имя шаблона"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <button className={styles.save} onClick={saveTemplate}>Сохранить шаблон</button>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Темы</h4>
            <div className={styles.templates}>
              {Object.keys(templates).map((themeKey) => (
                <div key={themeKey}>
                  <button
                    className={styles.themeHeader}
                    onClick={() => toggleTheme(themeKey)}
                  >
                    {themeKey}
                  </button>

                  {expandedThemes[themeKey] && (
                    <div className={styles.templateList}>
                      {templates[themeKey].map((tmpl) => (
                        <div key={tmpl.id} className={styles.templateItem}>
                          <button
                            className={styles.template}
                            onClick={() => loadTemplate(themeKey, tmpl)}
                            disabled={selectedTemplateId === tmpl.id}
                          >
                            {tmpl.name}
                          </button>
                          <button onClick={() => requestDeleteTemplate(tmpl.id)}>🗑</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Результаты</h4>
            {paths.length === 0 ? (
              <p className={styles.empty}>Ничего не сгенерировано</p>
            ) : (
              <div className={styles.generated}>
                {paths.map((p, i) => (
                  <div key={i} className={styles.resultItem}>
                    <span className={styles.resultNumber}>{i + 1}.</span> {p}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button className={styles.generateButton} onClick={handleGenerate}>Сгенерировать</button>
            <button className={styles.clearButton} onClick={() => setShowClearModal(true)}>Очистить</button>
          </div>
        </>
      )}

      {showThemeModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h4 className={styles.modalTitle}>Новая тема</h4>
            <input
              className={styles.input}
              placeholder="Название темы"
              value={newThemeName}
              onChange={e => setNewThemeName(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.save}
                onClick={() => {
                  if (newThemeName && !templates[newThemeName]) {
                    setTemplates(prev => ({ ...prev, [newThemeName]: [] }));
                    setTemplateTheme(newThemeName);
                  }
                  setShowThemeModal(false);
                  setNewThemeName('');
                }}
              >
                Сохранить
              </button>
              <button
                className={styles.clearButton}
                onClick={() => {
                  setShowThemeModal(false);
                  setNewThemeName('');
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h4 className={styles.modalTitle}>Очистить холст?</h4>
            <p>Вы уверены, что хотите удалить все элементы с поля?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.clearButton}
                onClick={() => {
                  onClear();
                  setSelectedTemplateId(null);
                  setShowClearModal(false);
                }}
              >
                Очистить
              </button>
              <button
                className={styles.button}
                onClick={() => setShowClearModal(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h4 className={styles.modalTitle}>Удалить шаблон?</h4>
            <p>Шаблон будет безвозвратно удалён. Продолжить?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.clearButton}
                onClick={confirmDeleteTemplate}
              >
                Удалить
              </button>
              <button
                className={styles.button}
                onClick={() => {
                  setShowDeleteModal(false);
                  setTemplateToDelete(null);
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
