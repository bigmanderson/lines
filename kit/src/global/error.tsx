import { GlobalRoute } from "./route.ts";

<Fragment name="GlobalError">
  <Error
    error={GlobalRoute.error}
    on:home={() => GlobalRoute.to("/")}
    on:back={() => GlobalRoute.back()}
    on:reload={() => GlobalRoute.reload()}
  />
</Fragment>

<Fragment name="Error">
  <GlobalError />
</Fragment>
