const DEMO_TWO_CODE_SNIPPET = `<Media.Root>
  <Editor 
    mediaComponent={
      <HLS.Video src='/manifest.m3u8' />
    }
  >
    <TimelineEditor>
      <TimelineControlBar />
      <TimelineContainer>
        <TimelineHeader />
        <TimelineSubtitlesTrack>
          <TimelineSubtitleCueEditor />
        </TimelineSubtitlesTrack>
      </TimelineContainer>
    </TimelineEditor>
  </Editor>
</Media.Root>`

function CodeSnippet({
    snippet
}: {
    snippet: string
}) {
    return <div className='bg-black flex flex-row gap-4 text-xs md:text-sm 2xl:text-base'>
        <pre className='text-grayA-9'>
            {snippet.split('\n').map((_, i) => `${i + 1}`.padStart(2, ' ')).join('\n')}
        </pre>
        <pre>
            {snippet}
        </pre>
    </div>
}

export default function DemoTwoCodeSnippet() {
    return <CodeSnippet snippet={DEMO_TWO_CODE_SNIPPET} />
}