const SampleComponent = () => {
  // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
  return <>Sample Component </>;
};

export default SampleComponent;
