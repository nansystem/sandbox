import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Post {
  id: number;
  title: string;
  content: string;
}

function PostListWithQuery() {
  const { data, isLoading, error, isFetching, refetch } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      console.log('[TanStack Query] API 呼び出し中...');
      const res = await fetch('http://localhost:3001/posts');
      if (!res.ok) throw new Error('API error');
      return res.json();
    },
    staleTime: 5000, // 5秒間はキャッシュを使用
    retry: 2, // エラー時は2回リトライ
  });

  if (isLoading) return <p>初期読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>エラー: {error.message}</p>;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => refetch()}>
          再フェッチ {isFetching && '中...'}
        </button>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          isFetching: {isFetching ? 'true (API 呼び出し中)' : 'false'}
        </p>
      </div>
      <ul>
        {data?.map((post) => (
          <li key={post.id}>
            {post.title} - {post.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SinglePostWithQuery({ id }: { id: number }) {
  const { data, isLoading, error, isFetching } = useQuery<Post>({
    queryKey: ['post', id],
    queryFn: async () => {
      console.log(`[TanStack Query] Post ${id} を取得中...`);
      const res = await fetch(`http://localhost:3001/posts/${id}`);
      if (!res.ok) throw new Error('Post not found');
      return res.json();
    },
    staleTime: 5000,
    retry: 1,
  });

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>エラー: {error.message}</p>;

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h4>{data?.title}</h4>
      <p>{data?.content}</p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        isFetching: {isFetching ? 'true' : 'false'}
      </p>
    </div>
  );
}

export function TanStackQueryDemo() {
  const [selectedId, setSelectedId] = useState(1);

  return (
    <div style={{ border: '1px solid blue', padding: '1rem' }}>
      <h2>TanStack Query デモ</h2>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        キャッシング、リトライ、isFetching の分離が自動的に機能します。
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <h3>全ポストを取得</h3>
        <PostListWithQuery />
      </div>

      <div>
        <h3>個別ポストを取得</h3>
        <div style={{ marginBottom: '0.5rem' }}>
          {[1, 2, 3].map((id) => (
            <button
              key={id}
              onClick={() => setSelectedId(id)}
              style={{ marginRight: '0.5rem', fontWeight: selectedId === id ? 'bold' : 'normal' }}
            >
              Post {id}
            </button>
          ))}
        </div>
        <SinglePostWithQuery id={selectedId} />
      </div>
    </div>
  );
}
