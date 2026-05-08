'use client';

import FilePlayer from '../shared/FileCard';

export default function FileGrid({ files }) {
  if (files.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        No files available
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
    }}>
      {files.map(file => (
        <FilePlayer key={file.id} file={file} />
      ))}
    </div>
  );
}