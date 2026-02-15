import { useState } from 'react';
import useSWR from 'swr';

interface Post {
  id: number;
  title: string;
  content: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('API error');
  return res.json();
};

function PostListWithSWR() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<Post[]>(
    'http://localhost:3001/posts',
    fetcher,
    {
      revalidateOnFocus: true, // ウィンドウフォーカス時に再フェッチ
      dedupingInterval: 5000, // 5秒間、同じリクエストを去重
      focusThrottleInterval: 5000,
    }
  );

  if (isLoading) return <p>初期読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>エラー: {error.message}</p>;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => mutate()}>
          再フェッチ {isValidating && '中...'}
        </button>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          isValidating: {isValidating ? 'true (API 呼び出し中)' : 'false'}
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

function SinglePostWithSWR({ id }: { id: number }) {
  const { data, error, isLoading, isValidating } = useSWR<Post>(
    `http://localhost:3001/posts/${id}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>エラー: {error.message}</p>;

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h4>{data?.title}</h4>
      <p>{data?.content}</p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        isValidating: {isValidating ? 'true' : 'false'}
      </p>
    </div>
  );
}

export function SWRDemo() {
  const [selectedId, setSelectedId] = useState(1);

  return (
    <div style={{ border: '1px solid green', padding: '1rem' }}>
      <h2>SWR デモ</h2>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        シンプルな API、stale-while-revalidate パターン。ウィンドウフォーカス時に自動再フェッチ。
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <h3>全ポストを取得</h3>
        <PostListWithSWR />
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
        <SinglePostWithSWR id={selectedId} />
      </div>
    </div>
  );
}
