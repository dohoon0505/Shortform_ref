import Head from 'next/head';
import IntroductionPage from '../../components/IntroductionPage';

export default function AboutIntroductionPage() {
  return (
    <>
      <Head>
        <title>회사소개 | KT&G</title>
      </Head>
      <main>
        <IntroductionPage />
      </main>
    </>
  );
}
