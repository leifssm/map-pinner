import { Grid } from "@mui/material"
import BoundryWrapper from "../lib/components/BoundryWrapper"
import { Map } from "../lib/components/Map"

const Index = () => {
  return (
    <Grid container height="100vh">
      <Grid item xs={4}>
        Menu
      </Grid>
      <Grid item xs={8}>
        <BoundryWrapper element={Map} />
      </Grid>
    </Grid>
  )
}

export default Index