'use client';
import { useState, useEffect } from 'react';
import UserLayout from '@/components/user/UserLayout';
import CategoryCard from '@/components/user/CategoryCard';
import EmptyState from '@/components/shared/EmptyState';
import PageHeader from '@/components/shared/PageHeader';

export default function page() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        setCats(data.categories || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const topLevel = cats.filter(c => !c.parent_id);

  if (loading) {
    return (
      <UserLayout>
        <div style={{ textAlign:'center', padding:60 }}>
          <div
            className="spin"
            style={{
              width:28,
              height:28,
              border:'3px solid var(--border)',
              borderTopColor:'var(--accent)',
              borderRadius:'50%',
              margin:'0 auto'
            }}
          />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <PageHeader
        title="🏷️ Categories"
        subtitle={`${topLevel.length} categories`}
      />

      {topLevel.length === 0 ? (
        <EmptyState
          icon="🏷️"
          message="No categories found."
        />
      ) : (
        <div
          style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))',
            gap:'clamp(16px,2vw,24px)'
          }}
        >
          {topLevel.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              index={i}
            />
          ))}
        </div>
      )}
    </UserLayout>
  );
}