import { useRef } from 'react';
import styles from './FileUpload.module.css';

function FileZone({ label, file, onFile, tag }) {
  const ref = useRef();

  function onDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }

  function onChange(e) {
    if (e.target.files[0]) onFile(e.target.files[0]);
  }

  return (
    <div
      className={`${styles.zone} ${file ? styles.zoneLoaded : ''}`}
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => ref.current.click()}
    >
      <input ref={ref} type="file" accept=".xlsx,.xls,.csv" onChange={onChange} hidden />
      <div className={styles.zoneTag}>{tag}</div>
      {file ? (
        <div className={styles.fileInfo}>
          <span className={styles.fileIcon}>▤</span>
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.uploadIcon}>⬆</span>
          <span className={styles.uploadLabel}>{label}</span>
          <span className={styles.uploadHint}>drag & drop or click</span>
        </div>
      )}
    </div>
  );
}

export default function FileUpload({ file1, file2, onFile1, onFile2, onNext, loading }) {
  return (
    <div className={styles.root}>
      <div className={styles.headline}>
        <h1 className={styles.title}>Excel Merger</h1>
        <p className={styles.sub}>Upload two spreadsheets and merge them on any shared column.</p>
      </div>

      <div className={styles.zones}>
        <FileZone label="Primary file" file={file1} onFile={onFile1} tag="FILE 1" />
        <div className={styles.joinSymbol}>⟷</div>
        <FileZone label="Secondary file" file={file2} onFile={onFile2} tag="FILE 2" />
      </div>

      <button
        className={styles.nextBtn}
        onClick={onNext}
        disabled={!file1 || !file2 || loading}
      >
        {loading ? <span className={styles.spinner} /> : 'Continue →'}
      </button>
    </div>
  );
}
