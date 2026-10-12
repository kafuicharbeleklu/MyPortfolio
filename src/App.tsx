import React, { Suspense } from 'react';

const SiteRoot = React.lazy(() => import('./site/SiteRoot'));

function App() {
  return (
    <Suspense fallback={null}>
      <SiteRoot />
    </Suspense>
  );
}

export default App;
