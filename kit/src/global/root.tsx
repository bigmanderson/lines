<Fragment name="GlobalRoot">
  <Dynamic chain={GlobalRoute.chain} otherwise={Loader} />
</Fragment>

<Fragment name="Root">
  <GlobalRoot />
</Fragment>
