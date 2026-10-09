import { lazy, Suspense, useEffect, useState } from 'react';
import PlayerDemoHeader from './PlayerDemoHeader';

const demos = {
	player: lazy(() => import('./PlayerDemo')),
	editor: lazy(() => import('./EditorDemo')),
	lyrics: lazy(() => import('./LyricsDemo')),
};

export default function DeferredDemo({ demo, label }: { demo: keyof typeof demos; label: string }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const Demo = demos[demo];
	let placeholder = <div className="demo-placeholder">
		<p>{label}<noscript><br />Enable JavaScript to try this demo.</noscript></p>
	</div>;
	if (demo === 'player') {
		placeholder = <div className="flex flex-col gap-4" aria-label={label} aria-busy="true">
			<PlayerDemoHeader />
			<div className="overflow-hidden border border-ink bg-ink">
				<img src="/sprite-fright.jpg" alt="" width={2048} height={858} className="block aspect-[2048/858] w-full object-cover" />
				<div className="h-[45px] border-t border-ink bg-paper" />
			</div>
			<noscript>Enable JavaScript to try this demo.</noscript>
		</div>;
	}

	return <div className={`deferred-demo deferred-demo-${demo}`}>
		{mounted ? <Suspense fallback={placeholder}><Demo /></Suspense> : placeholder}
	</div>;
}
