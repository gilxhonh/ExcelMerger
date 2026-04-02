import { useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload.jsx';
import MergeConfig from './components/MergeConfig.jsx';
import styles from './App.module.css';

const STEPS = ['Upload Files', 'Configure Merge', 'Download'];

export default function App() {
  const [step, setStep] = useState(0);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePreview() {
    if (!file1 || !file2) { setError('Please upload both files.'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file1', file1);
      fd.append('file2', file2);
      const { data } = await axios.post('https://excel-merger-server.vercel.app/api/preview', fd);
      setPreview(data);
      setStep(1);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to read files.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMerge(config) {
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file1', file1);
      fd.append('file2', file2);
      fd.append('joinColumn', config.joinColumn);
      fd.append('mergeType', config.mergeType);
      fd.append('columnsFromFile2', JSON.stringify(config.columnsFromFile2));

      const res = await axios.post('https://excel-merger-server.vercel.app/api/merge', fd, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      setStep(2);
    } catch (e) {
      setError('Merge failed. Check your configuration.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(0); setFile1(null); setFile2(null);
    setPreview(null); setError('');
  }

  return (
    <div className={styles.root}>
      <div className={styles.bg} />

      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>XLMERGE</span>
        </div>
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={s} className={`${styles.stepItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
              <div className={styles.stepDot}>{i < step ? '✓' : i + 1}</div>
              <span className={styles.stepLabel}>{s}</span>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>
      </header>

      <main className={styles.main}>
        {error && <div className={styles.error}>{error}</div>}

        {step === 0 && (
          <FileUpload
            file1={file1} file2={file2}
            onFile1={setFile1} onFile2={setFile2}
            onNext={handlePreview} loading={loading}
          />
        )}

        {step === 1 && preview && (
          <MergeConfig
            preview={preview}
            onMerge={handleMerge}
            onBack={() => setStep(0)}
            loading={loading}
          />
        )}

        {step === 2 && (
          <div className={styles.done}>
            <div className={styles.doneIcon}>✓</div>
            <h2 className={styles.doneTitle}>Merge complete</h2>
            <p className={styles.doneSub}>Your file has been downloaded.</p>
            <button className={styles.resetBtn} onClick={reset}>Merge another</button>
          </div>
        )}
      </main>
    </div>
  );
}
