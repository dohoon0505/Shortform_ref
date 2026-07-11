import Head from 'next/head';
import Hero from '../components/Hero';
import Global from '../components/Global';
import Sustainability from '../components/Sustainability';
import Invest from '../components/Invest';
import News from '../components/News';
import With from '../components/With';

export default function Home() {
  return (
    <>
      <Head>
        <title>KT&G</title>
        <meta name="description" content="KT&G 글로벌 코퍼레이트 사이트 — 디자인 레퍼런스 클론" />
      </Head>
      <main>
        <Hero />
        <Global />
        <Sustainability />
        <News />
        <Invest />
        <With />
      </main>
    </>
  );
}
