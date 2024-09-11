'use client';

import { useDemoStore } from '@/stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import { useLiveChat, useLiveChatMessageType } from 'next-youtube-livechat';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AutoSizer, Index, List, ListRowProps } from 'react-virtualized';

import UrlInput from '@/components/UrlInput';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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
  // get single row
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
      style={{
        originX: 0.5,
        originY: 0.5,
        ...style,
      }}
      className={cn(
        'flex flex-col items-start justify-center gap-2 whitespace-pre-wrap'
      )}
    >
      <div className='flex items-center gap-3'>
        <Avatar className='flex items-center justify-center'>
          <AvatarImage
            src={message.avatar}
            alt={message.name}
            width={6}
            height={6}
          />
        </Avatar>
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

const Demo = ({parsedUrl}: {parsedUrl?: string}) => {
  const router = useRouter()
  const { isReady, isLoading, setUrl, setIsReady, setIsLoading } =
    useDemoStore();
  const listRef = useRef<List>(null);
  const [enableAutoScroll, setEnableAutoScroll] = useState<boolean>(false);
  const { toast } = useToast();

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
        description: (err as unknown as Error).message,
        variant: 'destructive',
      });
      setIsLoading(false);
      setIsReady(false);
      setUrl();
    },
    [setIsLoading, setIsReady, setUrl, toast]
  );

  const { messages, liveDetails } = useLiveChat({
    url: parsedUrl,
    isReady,
    onBeforeStart,
    onStart,
    onError,
  });

  useEffect(() => {
    if (!enableAutoScroll) return;
    if (listRef?.current) {
      listRef.current.scrollToRow(messages.length - 1);
    }
  }, [enableAutoScroll, messages.length]);

  return (
    <div className='z-40 mt-4 flex h-screen w-[calc(100dvw-10rem)] flex-col items-center justify-start'>
      <div className='flex h-full w-full flex-col overflow-y-auto overflow-x-hidden gap-4'>
        <UrlInput
          isLoading={isLoading}
          isReady={isReady}
          handleUrlSubmit={async (url: string) => {
            router.push(`/${url}`)
          }}
        />
        <div className='flex h-full w-full items-start'>
          {messages.length != 0 && (
            <AnimatePresence>
              <div className='flex h-full w-full flex-col overflow-y-auto overflow-x-hidden pr-2'>
                <AutoSizer>
                  {({ width, height }) => (
                    <List
                      ref={listRef}
                      width={width}
                      height={height}
                      rowCount={messages.length}
                      onScroll={({ clientHeight, scrollHeight, scrollTop }) => {
                        if (scrollTop + clientHeight + 20 >= scrollHeight) {
                          // when scroll to bottom list, keep scroll to bottom on new message receive
                          if (!enableAutoScroll) {
                            setEnableAutoScroll(true);
                          }
                        } else {
                          if (enableAutoScroll) {
                            setEnableAutoScroll(false);
                          }
                        }
                      }}
                      rowHeight={(page: Index) => {
                        const cc = messages[page.index].characterCount;
                        // max word = 200
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
                          messages={messages}
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
