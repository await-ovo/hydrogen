---
gid: 16335d29-3334-49d5-bdcc-d9ec832fbffd
title: Internationalization
description: Learn how configure support in your Hydrogen app for international merchants and customers.
---

Internationalization helps merchants expand their business to a global audience by creating shopping experiences in local languages and currencies. This guide provides information on configuring localized experiences for merchants and customers in your Hydrogen app.

## Default configuration

You can configure your app's default locale in the Hydrogen configuration file. You can also set up dynamic configurations in your Hydrogen app for multiple stores.

The [Hydrogen configuration file](https://shopify.dev/custom-storefronts/hydrogen/framework/hydrogen-config) contains information that's needed at runtime for routing, connecting to the Storefront API, and many other options.

You can set your app's default locale and language using the `defaultLocale` and `languageCode` properties in your Hydrogen configuration file. 

The `defaultLocale` property corresponds to a valid locale identifier used to make the request, using the [IETF language tag nomenclature](https://en.wikipedia.org/wiki/IETF_language_tag). The first letter code represents the language, and the second letter code represents the region. 

The `languageCode` property corresponds to the first two characters of `defaultLocale`, using [ISO 639-1 nomenclature](https://shopify.dev/api/storefront/2022-04/enums/languagecode) for language codes supported by Shopify.

In the following example, the default locale of the app is set to `EN-US` and the language is set to `EN`:

{% codeblock file, filename: 'hydrogen.config.js' %}
```tsx
export default defineConfig({
  shopify: {
    /* The app's locale */
    defaultLocale: 'EN-US',
    languageCode: 'EN',
  },
});
```
{% endcodeblock %}


## Detecting a visitor's geolocation

The geographic location of your visitors helps you localize the experience to their preferred country and language. 

### Oxygen deployments

For Hydrogen shops hosted on Oxygen, a visitor’s geolocation can be accessed through the `request` object and retrieved using `request.headers.get()`.

{% codeblock file, filename: 'index.server.jsx' %}

```tsx
export default function Homepage({request}) {
  return (
    <div>Thanks for visiting from {request.headers.get(‘oxygen-buyer-country’)}!</div>
  )
}
```

{% endcodeblock %}

The geolocation variables available from Oxygen include:

- `'oxygen-buyer-ip'`
- `'oxygen-buyer-latitude'`
- `'oxygen-buyer-longitude'`
- `'oxygen-buyer-continent'`
- `'oxygen-buyer-country'`
- `'oxygen-buyer-region'`
- `'oxygen-buyer-region-code'`
- `'oxygen-buyer-city'`


### Non-Oxygen deployments

Alternatively, you can access the [Accept-Language](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language) HTTP header as a hint to the visitor's country and language preference. You may also consider using a third-party geolocation library, such as [`geoip-lite`](https://www.npmjs.com/package/geoip-lite).

{% codeblock file, filename: 'index.server.jsx' %}

```tsx
export default function Homepage({request}) {
  const acceptLanguage = request.headers.get(‘accept-language’);
}
```

{% endcodeblock %}


## Internationalized routing

Once you've detected a visitor's geolocation, you can assign custom routes to host and render a localized experience. 

Hydrogen supports two strategies for internationalized routes: domains and subfolders.

Examples of domain or subdomain routing:
- `yourshop.com, yourshop.ca, yourshop.co.uk, etc.`
- `us.yourshop.com, ca.yourshop.com, uk.yourshop.com, etc.`

Examples of subfolder routing:
- `yourshop.com/en/products`
- `yourshop.com/en-CA/products`
- `yourshop.com/fr/produits`

### Domains or Subdomains

Once you've set up your domains and/or subdomains in Oxygen, or third-party hosting provider, you can assign these domains to a given locale.

{% codeblock file, filename: 'App.server.jsx' %}

```tsx
function App({routes}) {
  
  
  return (. . .)
}
```

{% endcodeblock %}


### Subfolders
Subfolder routes use the visitor's locale in the URL path. In Hydrogen, the FileRoute component can be used to prefix all file routes with a locale using the `basePath` parameter, and source the corresponding file routes. 

{% codeblock file, filename: 'App.server.jsx' %}

import {Router, FileRoutes, Route} from '@shopify/hydrogen';
function App() {
  const esRoutes = import.meta.globEager('./custom-routes/es/**/*.server.jsx');
  const enRoutes = import.meta.globEager('./custom-routes/en/**/*.server.jsx');

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ShopifyProvider>
        <CartProvider>
          <Router>
            <FileRoutes />
            <FileRoutes basePath="/es/" routes={esRoutes} />
            <FileRoutes basePath="/en/" routes={enRoutes} />
            <Route path="*" page={<NotFound />} />
          </Router>
        </CartProvider>
      </ShopifyProvider>
    </Suspense>
  );
}
function NotFound() {
  return <h1>Not found</h1>;
}

{% endcodeblock %}


## Localization

Shopify helps merchants, all over the world, sell to customers, all over the world. This means that there are multiple currencies and languages that they might need to sell in.

### Localization components and hooks

Hydrogen includes the following localization components and hooks:

- **[`LocalizationProvider`](https://shopify.dev/api/hydrogen/components/localization/localizationprovider)**: A component that automatically queries the Storefront API's [localization](https://shopify.dev/api/storefront/latest/objects/queryroot) field for the `isoCode` and `name` of the `country` and keeps this information in a context.

- **[`useCountry`](https://shopify.dev/api/hydrogen/hooks/localization/usecountry)**: A hook that returns a tuple of the current localization country and a function for updating it.

> Note:
> Any descendents of `LocalizationProvider` can use the `useCountry` hook. The `isoCode` of the `country` can be used in the Storefront API's [`@inContext` directive](https://shopify.dev/api/examples/international-pricing) as the `country` value.

### Language translations

You can use the Storefront API's `@inContext` directive to support multiple languages on a storefront. For example, you might need to retrieve a list of available languages, query translatable resources and return translated content, or create a checkout in a customer's language.

For more information about retrieving language translations, refer to [Support multiple languages on storefronts](https://shopify.dev/api/examples/multiple-languages).

### Search Engine Optimization

Hydrogen provides an [`Seo`](https://shopify.dev/api/hydrogen/components/primitive/seo) component that renders SEO information on a webpage. The language of the default page (`defaultSeo`) defaults to the `defaultLocale` value provided in your Hydrogen configuration file or `EN-US` when not specified.

For more information about customizing the output of SEO-related tags in your Hydrogen app, refer to [SEO](https://shopify.dev/custom-storefronts/hydrogen/framework/seo).

### `useServerProps` hook

Hydrogen provides a [`useServerProps`](https://shopify.dev/api/hydrogen/hooks/global/useserverprops) hook with a `setServerProps` helper function, which allows you to re-render the server component with new `props`. This is useful to paginate within collections, switch product variants, or do anything that requires new data from the server.

For example, you can take geolocation co-ordinates and set them as server props to provide a new hydrated experience for the current location:

{% codeblock file, filename: 'GeoLocate.client.jsx' %}

```js
navigator.geolocation.getCurrentPosition((data) => {
  setServerProps('geoCoordinates', data);
});
```

{% endcodeblock %}

## Next steps

- Learn about [Hydrogen's configuration properties](https://shopify.dev/custom-storefronts/hydrogen/framework/hydrogen-config) and how to change the location of the configuration file.
- Consult the references for the [`LocalizationProvider`](https://shopify.dev/api/hydrogen/components/localization/localizationprovider) component and [`useCountry`](https://shopify.dev/api/hydrogen/hooks/localization/usecountry) hook.
- Learn how to customize the output of [SEO-related tags](https://shopify.dev/custom-storefronts/hydrogen/framework/seo) in your Hydrogen client and server components.