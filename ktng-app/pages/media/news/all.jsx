import Head from 'next/head';
import MediaPage from '../../../components/MediaPage';

export default function MediaAllPage() {
  return (
    <>
      <Head>
        <title>뉴스룸 | KT&G</title>
      </Head>
      <main>
        <MediaPage />
      </main>
    </>
  );
}
