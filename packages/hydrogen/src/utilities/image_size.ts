import type {Image as ImageType} from '../storefront-api-types';
import type {PartialDeep} from 'type-fest';
import type {
  ShopifyLoaderOptions,
  ShopifyLoaderParams,
} from '../components/Image';

// TODO: Are there other CDNs missing from here?
const PRODUCTION_CDN_HOSTNAMES = [
  'cdn.shopify.com',
  'cdn.shopifycdn.net',
  'shopify-assets.shopifycdn.com',
  'shopify-assets.shopifycdn.net',
];
const LOCAL_CDN_HOSTNAMES = ['spin.dev'];
const ALL_CDN_HOSTNAMES = [...PRODUCTION_CDN_HOSTNAMES, ...LOCAL_CDN_HOSTNAMES];

/**
 * Adds image size parameters to an image URL hosted by Shopify's CDN
 */
export function addImageSizeParametersToUrl({
  src,
  width,
  height,
  crop,
  scale,
}: ShopifyLoaderParams) {
  const newUrl = new URL(src);

  const multipliedScale = scale ?? 1;

  width &&
    newUrl.searchParams.append(
      'width',
      (Number(width) * multipliedScale).toString()
    );

  height &&
    newUrl.searchParams.append(
      'height',
      (Number(height) * multipliedScale).toString()
    );
  crop && newUrl.searchParams.append('crop', crop);

  // for now we intentionally leave off the scale param, and instead multiple width & height by scale instead
  // scale && newUrl.searchParams.append('scale', scale.toString());

  return newUrl.toString();
}

export function shopifyImageLoader(params: ShopifyLoaderParams) {
  const newSrc = new URL(params.src);
  const isShopifyServedImage = ALL_CDN_HOSTNAMES.some((allowedHostname) =>
    newSrc.hostname.endsWith(allowedHostname)
  );

  if (
    !isShopifyServedImage ||
    (!params.width && !params.height && !params.crop && !params.scale)
  ) {
    return params.src;
  }

  return addImageSizeParametersToUrl(params);
}

type HtmlImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export type GetShopifyImageDimensionsProps = {
  data: Pick<
    PartialDeep<ImageType>,
    'altText' | 'url' | 'id' | 'width' | 'height'
  >;
  loaderOptions?: ShopifyLoaderOptions;
  elementProps?: {
    width?: HtmlImageProps['width'];
    height?: HtmlImageProps['height'];
  };
};

type GetShopifyImageDimensionsPropsReturn = {
  width: number | string | null;
  height: number | string | null;
};

/**
 * Width and height are determined using the followiing priority list:
 * 1. `loaderOptions`'s width/height
 * 2. `elementProps`'s width/height
 * 3. `data`'s width/height
 *
 * If only one of `width` or `height` are defined, then the other will attempt to be calculated based on the Image's aspect ratio,
 * provided that both `data.width` and `data.height` are available. If not, then the aspect ratio cannot be determined and the missing
 * value will reamin as `null`
 */
export function getShopifyImageDimensions({
  data: sfapiImage,
  loaderOptions,
  elementProps,
}: GetShopifyImageDimensionsProps): GetShopifyImageDimensionsPropsReturn {
  let aspectRatio: number | null = null;

  if (sfapiImage?.width && sfapiImage?.height) {
    aspectRatio = sfapiImage?.width / sfapiImage?.height;
  }

  //  * 1. `loaderOptions`'s width/height
  if (loaderOptions?.width || loaderOptions?.height) {
    return {
      width:
        loaderOptions?.width ??
        (aspectRatio
          ? // @ts-expect-error if width isn't defined, then height has to be defined due to the If statement above
            Math.round(aspectRatio * loaderOptions.height)
          : null),
      height:
        loaderOptions?.height ??
        (aspectRatio
          ? // @ts-expect-error if height isn't defined, then width has to be defined due to the If statement above
            Math.round(aspectRatio * loaderOptions.width)
          : null),
    };
  }

  //  * 2. `elementProps`'s width/height
  if (elementProps?.width || elementProps?.height) {
    return {
      width:
        elementProps?.width ??
        (aspectRatio
          ? // @ts-expect-error if width isn't defined, then height has to be defined due to the If statement above
            Math.round(aspectRatio * elementProps.height)
          : null),
      height:
        elementProps?.height ??
        (aspectRatio
          ? // @ts-expect-error if height isn't defined, then width has to be defined due to the If statement above
            Math.round(aspectRatio * elementProps.width)
          : null),
    };
  }

  //  * 3. `data`'s width/height
  if (sfapiImage?.width || sfapiImage?.height) {
    return {
      // can't calculate the aspect ratio here
      width: sfapiImage?.width ?? null,
      height: sfapiImage?.height ?? null,
    };
  }

  return {width: null, height: null};
}
