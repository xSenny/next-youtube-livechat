'use client';

import { useDemoStore } from '@/stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import { useLiveChat, useLiveChatMessageType } from 'next-youtube-livechat';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AutoSizer, Index, List, ListRowProps } from 'react-virtualized';



import UrlInput from '@/components/UrlInput';
import { useToast } from '@/components/ui/use-toast';



import { cn } from '@/lib/utils';


interface RowRendererProps extends ListRowProps {
  messages: useLiveChatMessageType[];
  childKey: string;
}

const RowRenderer = ({
  messages,
  index,
  childKey,
  style,
}: RowRendererProps) => {
  const message = messages[index];
  return (
    <motion.div
      key={childKey}
      layout
      initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
      transition={{
        opacity: { duration: 0.1 },
        layout: {
          type: 'spring',
          bounce: 0.3,
          duration: 0.5,
        },
      }}
      style={{ originX: 0.5, originY: 0.5, ...style }}
      className={cn(
        'flex flex-col items-start justify-center gap-2 whitespace-pre-wrap'
      )}
    >
      <div className='flex items-center gap-3'>
        <div className='rounded-md bg-green-400 p-3 flex gap-2'>
          <div className='rounded-lg bg-primary mb-2 px-2 w-fit'>
            {message.name}
          </div>
          <span className='relative inline-block'>{message.message}</span>
        </div>
      </div>
    </motion.div>
  );
};

const Demo = ({ parsedUrl }: { parsedUrl?: string }) => {
  const router = useRouter();
  const [url, setUrl] = useState(parsedUrl);
  const { isReady, isLoading, setIsReady, setIsLoading } = useDemoStore();
  const listRef = useRef<List>(null);
  const [enableAutoScroll, setEnableAutoScroll] = useState<boolean>(true);
  const { toast } = useToast();
  const [parsedMessages, setParsedMessages] = useState<
    { name: string; message: string; characterCount: number }[]
  >([]);

  const onBeforeStart = useCallback(() => {
    setIsLoading(true);
  }, [setIsLoading]);

  const onStart = useCallback(() => {
    setIsLoading(false);
    setIsReady(true);
  }, [setIsLoading, setIsReady]);

  const onError = useCallback(
    (err: Error) => {
      toast({
        title: '🚨Oops...',
        description: err.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      setIsReady(false);
      setUrl(undefined);
    },
    [setIsLoading, setIsReady, setUrl, toast]
  );

  const { messages } = useLiveChat({
    url,
    isReady,
    onBeforeStart,
    onStart,
    onError,
  });

  const sendMessage = (name: string, message: string) => {
    console.log('Sending message:', { name, message });
    setParsedMessages((prevMessages) => [
      ...prevMessages,
      { name, message, characterCount: message.length },
    ]);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Setting sendMessage function on window');
      //@ts-ignore
      window.sendMessage = sendMessage;
    }
  }, []);

  useEffect(() => {
    setParsedMessages((prevParsedMessages) => {
      const newMessages = messages.map((m: {name: string, message: string, characterCount: number}) => ({
        name: m.name,
        message: m.message,
        characterCount: m.characterCount,
      }));

      console.log(prevParsedMessages, 'prev parsed')
      console.log(newMessages, 'new messages')

      // Merge newMessages with prevParsedMessages, preserving added messages
      const mergedMessages = prevParsedMessages.concat(newMessages)
      console.log(mergedMessages, "merged")
      return mergedMessages;
    });
  }, [messages])

  useEffect(() => {

    if (!enableAutoScroll) return;
    if (listRef.current) {
      listRef.current.scrollToRow(messages.length - 1);
    }
  }, [enableAutoScroll, messages]);

  return (
    <div className='z-40 mt-4 flex h-screen w-[calc(100dvw-10rem)] flex-col items-center justify-start'>
      <div className='flex h-full w-full flex-col overflow-y-auto overflow-x-hidden gap-4'>
        <UrlInput
          isLoading={isLoading}
          isReady={isReady}
          handleUrlSubmit={async (url: string) => {
            router.push(`/${url}`);
          }}
        />
        <div className='flex h-full w-full items-start'>
          {messages.length !== 0 && (
            <AnimatePresence>
              <div className='flex h-full w-full flex-col overflow-y-auto overflow-x-hidden pr-2'>
                <AutoSizer>
                  {({ width, height }) => (
                    <List
                      ref={listRef}
                      width={width}
                      height={height}
                      rowCount={parsedMessages.length}
                      // onScroll={({ clientHeight, scrollHeight, scrollTop }) => {
                      //   if (scrollTop + clientHeight + 20 >= scrollHeight) {
                      //     if (!enableAutoScroll) {
                      //       setEnableAutoScroll(true);
                      //     }
                      //   } else {
                      //     if (enableAutoScroll) {
                      //       setEnableAutoScroll(false);
                      //     }
                      //   }
                      // }}
                      rowHeight={({ index }) => {
                        const cc = parsedMessages[index].characterCount;
                        const baseHeight = 60;
                        const rowHeight = 22;
                        const row = cc / 40;
                        return baseHeight + row * rowHeight;
                      }}
                      overscanRowCount={3}
                      rowRenderer={(props) => (
                        <RowRenderer
                          {...props}
                          key={props.key}
                          childKey={props.key}
                          messages={parsedMessages}
                        />
                      )}
                    />
                  )}
                </AutoSizer>
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Demo;