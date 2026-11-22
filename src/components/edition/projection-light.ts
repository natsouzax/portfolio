export const projectionLight = `
  vec3 phosphor(vec3 wire, float body, float rim) {
    return vec3(.07, .21, .09) * body
        + wire * vec3(.76, 1., .42)
        + wire * wire * wire * vec3(.90, 1., .78)
        + rim * vec3(.40, .72, .25);
  }

  float raster(float y, float rows, float time, float strength) {
    return 1. - strength + strength * cos((y * rows - time * .4) * 6.2831853);
  }
`;
