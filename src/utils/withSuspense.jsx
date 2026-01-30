import { Flex, Spin } from "antd";
import { Suspense } from "react";

const withSuspense = (Component)=> {
  return (
    <Suspense fallback={<Flex justify="center" align="center" vertical><Spin/> <p>Loading page...</p></Flex>}>
      <Component />
    </Suspense>
  );
};

export default withSuspense;