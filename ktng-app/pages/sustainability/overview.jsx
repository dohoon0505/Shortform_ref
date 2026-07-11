import Head from 'next/head';
import ESGPage from '../../components/ESGPage';

export default function ESGOverviewPage() {
  return (
    <>
      <Head>
        <title>ESG 개요 | 지속가능경영 | KT&G</title>
      </Head>
      <main>
        <ESGPage />
      </main>
    </>
  );
}
