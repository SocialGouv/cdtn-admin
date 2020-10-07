import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { CreateThemePage } from "src/pages/themes/[id]/create";

export default withCustomUrqlClient(withUserProvider(CreateThemePage));
