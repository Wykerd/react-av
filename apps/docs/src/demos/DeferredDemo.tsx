import { lazy, Suspense, useEffect, useState } from 'react';

const demos = {
	editor: lazy(() => import('./EditorDemo')),
	lyrics: lazy(() => import('./LyricsDemo')),
};

export default function DeferredDemo({ demo, label }: { demo: keyof typeof demos; label: string }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const Demo = demos[demo];
	const placeholder = <div className="demo-placeholder">
		<p>{label}<noscript><br />Enable JavaScript to try this demo.</noscript></p>
	</div>;

	return <div className={`deferred-demo deferred-demo-${demo}`}>
		{mounted ? <Suspense fallback={placeholder}><Demo /></Suspense> : placeholder}
	</div>;
}
