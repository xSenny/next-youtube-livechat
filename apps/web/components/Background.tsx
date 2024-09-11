import Image from 'next/image';
import { PropsWithChildren } from 'react';

const DotPattern = ({ children }: PropsWithChildren) => (
  <div
    id='dot-pattern-animation'
    className='dot-pattern fixed z-[0] h-dvh w-dvw rounded-xl border transition-all'
  >
    {children}
  </div>
);

const CenterContainer = ({ children }: PropsWithChildren) => (
  <div
    id='bg-center-container'
    className='pointer-events-none fixed flex h-dvh w-dvw select-none items-center justify-center break-all opacity-[0.05] transition-all'
  >
    {children}
  </div>
);

const BackgroundGradient = ({ children }: PropsWithChildren) => (
  <div className='fixed h-screen w-screen bg-[#282a36]	bg-gradient-to-br  from-[#050b16] to-[#587d83]'>
    {children}
  </div>
);

const Background = () => (
  <div className="fixed h-screen w-screen bg-green-400">

  </div>
);

export default Background;
