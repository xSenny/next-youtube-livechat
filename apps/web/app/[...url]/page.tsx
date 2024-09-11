import AppCreditSection from '@/components/AppCreditSection';
import Demo from '@/components/Demo';

export default function Home({params}: {params: {url: string}}) {
  return (
    <main className='z-10 flex min-h-dvh flex-col items-center bg-[#282a36] p-4 text-gray-200'>
      {params.url}
      <AppCreditSection />
      <Demo parsedUrl={params.url}/>
    </main>
  );
}
