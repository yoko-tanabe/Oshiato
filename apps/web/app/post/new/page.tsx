import PostForm from '@/components/post/PostForm/PostForm';

export default function PostNewPage() {
  return (
    <main>
      <header style={{
        padding: '16px',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--color-background)',
        zIndex: 10,
      }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          推しスポットを投稿
        </h1>
      </header>
      <PostForm />
    </main>
  );
}
