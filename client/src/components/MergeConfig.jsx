import { useState, useMemo } from 'react';
import styles from './MergeConfig.module.css';

const MERGE_TYPES = [
  { value: 'left', label: 'Left Join', desc: 'Keep all rows from File 1, add matching data from File 2' },
  { value: 'outer', label: 'Outer Join', desc: 'Keep all rows from both files' },
];

export default function MergeConfig({ preview, onMerge, onBack, loading }) {
  const commonCols = useMemo(() => {
    const s = new Set(preview.file1.columns);
    return preview.file2.columns.filter(c => s.has(c));
  }, [preview]);

  const [joinColumn, setJoinColumn] = useState(commonCols[0] || preview.file1.columns[0]);
  const [mergeType, setMergeType] = useState('left');
  const [selectedCols, setSelectedCols] = useState(
    preview.file2.columns.filter(c => c !== joinColumn).slice(0, 3)
  );

  function toggleCol(col) {
    setSelectedCols(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  }

  function handleJoinChange(col) {
    setJoinColumn(col);
    setSelectedCols(prev => prev.filter(c => c !== col));
  }

  const file2Cols = preview.file2.columns.filter(c => c !== joinColumn);

  return (
    <div className={styles.root}>
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryTag}>FILE 1</span>
          <span className={styles.summaryVal}>{preview.file1.rowCount} rows · {preview.file1.columns.length} cols</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryTag}>FILE 2</span>
          <span className={styles.summaryVal}>{preview.file2.rowCount} rows · {preview.file2.columns.length} cols</span>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Join column */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>Join on column</div>
          <div className={styles.cardDesc}>The shared key to match rows between files</div>
          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={joinColumn}
              onChange={e => handleJoinChange(e.target.value)}
            >
              {preview.file1.columns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {commonCols.length > 0 && (
            <div className={styles.hint}>
              Common columns: {commonCols.slice(0, 5).join(', ')}{commonCols.length > 5 ? '…' : ''}
            </div>
          )}
        </div>

        {/* Merge type */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>Merge type</div>
          <div className={styles.cardDesc}>How to handle non-matching rows</div>
          <div className={styles.mergeTypes}>
            {MERGE_TYPES.map(m => (
              <div
                key={m.value}
                className={`${styles.mergeOption} ${mergeType === m.value ? styles.mergeActive : ''}`}
                onClick={() => setMergeType(m.value)}
              >
                <div className={styles.mergeRadio} />
                <div>
                  <div className={styles.mergeLabel}>{m.label}</div>
                  <div className={styles.mergeDesc}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columns from File 2 */}
        <div className={`${styles.card} ${styles.cardFull}`}>
          <div className={styles.cardLabel}>Columns to bring from File 2</div>
          <div className={styles.cardDesc}>
            Select which columns to add — they'll be appended with a <code>_File2</code> suffix if there's a name conflict.
          </div>
          <div className={styles.colGrid}>
            {file2Cols.map(col => (
              <label key={col} className={`${styles.colChip} ${selectedCols.includes(col) ? styles.colActive : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedCols.includes(col)}
                  onChange={() => toggleCol(col)}
                  hidden
                />
                <span className={styles.colCheck}>{selectedCols.includes(col) ? '✓' : ''}</span>
                <span className={styles.colName}>{col}</span>
              </label>
            ))}
          </div>
          <div className={styles.selectionCount}>
            {selectedCols.length} of {file2Cols.length} selected
            <button className={styles.selectAll} onClick={() => setSelectedCols(file2Cols)}>All</button>
            <button className={styles.selectAll} onClick={() => setSelectedCols([])}>None</button>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <button
          className={styles.mergeBtn}
          onClick={() => onMerge({ joinColumn, mergeType, columnsFromFile2: selectedCols })}
          disabled={!joinColumn || selectedCols.length === 0 || loading}
        >
          {loading ? <span className={styles.spinner} /> : 'Merge & Download →'}
        </button>
      </div>
    </div>
  );
}
