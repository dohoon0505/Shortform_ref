import Head from 'next/head';
import HistoryPage from '../../components/HistoryPage';

export default function AboutHistoryPage() {
  return (
    <>
      <Head>
        <title>연혁 | 회사소개 | KT&G</title>
      </Head>
      <main>
        <HistoryPage />
      </main>
    </>
  );
}
