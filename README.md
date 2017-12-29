# Skedify SDK / API client

**Release:**
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/skedify/sdk-js/develop/LICENSE)
[![npm](https://img.shields.io/npm/v/skedify-sdk.svg?maxAge=2592000)](https://www.npmjs.com/package/skedify-sdk)
[![Build Status](https://travis-ci.org/skedify/sdk-js.svg?branch=master)](https://travis-ci.org/skedify/sdk-js)
[![Code Coverage](https://codecov.io/gh/skedify/sdk-js/branch/master/graph/badge.svg)](https://codecov.io/gh/skedify/sdk-js)

**Development:**
[![Build Status](https://travis-ci.org/skedify/sdk-js.svg?branch=develop)](https://travis-ci.org/skedify/sdk-js)
[![Code Coverage](https://codecov.io/gh/skedify/sdk-js/branch/develop/graph/badge.svg)](https://codecov.io/gh/skedify/sdk-js)
[![GitHub issues](https://img.shields.io/github/issues/skedify/sdk-js.svg)](https://github.com/skedify/sdk-js/issues)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Goal

The goal of this SDK is to offer an easy to use tool to interact with the Skedify API when you're making a javascript integration.

## Construction

One would create an SDK with a simple constructor function:

```js
const SDK = new Skedify.API(options);
// eg const SDK = Skedify.API({ auth_provider: 'client://client_id=sfUMCWu09e41WWNgyD2gJ0CgSBikiG9nhVo2iZSG&realm=https://api.example.com', locale: 'nl-BE' })
```

This would allow various authentication strategies to be represented in a similar way, using a "schema" methodology.

## Options/configuration

The sdk requires several configuration options. These might also be updated on the fly after the client was already created.

```js
// READ the current configuration
console.log(SDK.configuration)

// EDIT the current configuration by merging a new object
SDK.configure({ ... })
```

The options are:

* **auth_provider**: Authentication Provider, a string which symbolizes how/where to get an Authorization header
* **locale**: A string combination of an ISO-639 Language Code and an ISO-3166 Country Code signifying the language preference of the user

## Basic Usage

Let's start with a simple use case: getting a list of subjects

```js
SDK.subjects() // the name of the collection is available as a function on the SDK instance
  .then(
    // the "collection" function performs a GET request to the corresponding endpoint and returns a Promise
    response => {
      /**
       * `response` is an object that represents the response from the API.
       * It contains multiple attributes:
       * - response.status: contains the status code from the response
       * - response.headers: contains the headers in the response
       * - response.meta: contains the "meta" portion from the response
       * - response.data: represents the actual "data" portion from the response.
       *       This will be an array, where each item represents a member of the collection in
       *       an "ActiveRecord"-like style
       */
      response.data.forEach(record => {
        record.id; // will be normalized: all ID's will be in string form
        record.title; // regular attributes will be accessible as properties
        record.duration = 60; // regular attributes will also be editable by default
        // This could be made extensible: a method record.isWritable('propName') could be added to check access rights.
        // Also, if not writable, trying to set a read-only attribute could throw an Error.
        // In addition to the attributes from the response data, the record will also have additional methods
        record.save(); // to save (only) the made changes to the API. Corresponds to a PATCH request.
        record.delete(); // to delete this one member from the collection. Corresponds to a DELETE request.
        record.replace(); // to replace all data from this member with another but reusing the ID. Corresponds to a PUT request.11
      });
    },
    error => {
      /**
       * `error` will always be an Error object.
       * It might contain a property `error.response`, in which case
       * `error.response` represents an error response returned from the API.
       * If `error.response` is absent, the error would signify an error with
       * transmission instead (eg network failure, abortion, ...)
       * Errors will have a boolean property `retryable` and optionally a method `retry`.
       * When `retry` is called (without parameters), it will behave as if the original
       * request was made again and will return a new Promise with the same properties
       * as the original call on the collection.
       */
    }
  );
```

> **NOTE**: check that, if an ID is provided but is falsey, it's still treated as a call for a single item (throw Error in this case) and not incorrectly interpreted as a collection call

> **NOTE**: the `retryable` and `retry` properties on error are optional features at first and can be added later without conflicts.

> **NOTE**: the `isWritable` method on a record and any additional logic related to access control are optional and can be added later without conflicts.

Instead of getting a collection, you could also directly access one member of a collection.
This can be done by providing the ID of the member (as a string) to the collection function.

```js
SDK.subjects("subject id here").then(
  // the function performs a GET request to the corresponding endpoint and returns a Promise
  response => {
    /**
     * `response` has the same properties as in the above call for the entire collection.
     * However, response.data will not be an Array of records, but instead be one record.
     */
  },
  error => {
    // `error` has the same properties as in the above call for the entire collection.
  }
);
```

## Subresources

You can get subresources by chaining the original collection call with a subresource call

```js
SDK.subjects("subject id here")
  .questions()
  .then(
    response => {
      // response.data will contain an Array of "question" records for the corresponding subject
    },
    error => {}
  );
```

## Includes

In addition to regular GET requests, you can also include related resources in a request.
This is done by chaining the original call with an extra call to an `include` method on the promise.
An include is described by the "collection" method on SDK. You can pass multiple includes in one include call.

```js
SDK.subjects()
  .include(SDK.subject_categories, SDK.subjects.questions)
  .then(response => {}, error => {});
// is the same as
SDK.subjects()
  .include(SDK.subject_categories)
  .include(SDK.subjects.questions)
  .then(response => {}, error => {});

// also:

SDK.subjects()
  .include(SDK.subject_categories, SDK.subjects.questions)
  .then(
    response => {
      response.data.forEach(subjectRecord => {
        // subjectRecord.subject_category will contain a subject_category record
        // subjectRecord.questions will contain an Array of "question" records
        // All these records will have the same properties (such as ID normalization, follow-up request methods, ...).
        // Included records are deduplicated by ID, meaning eg two subjects that belong to the same category, will get the same subject_category record)
        // => if subject1.subject_category.id === subject2.subject_category.id then subject1.subject_category === subject2.subject_category
      });
    },
    error => {}
  );
```

## Sorting

The user can request server-side sorting by using the `.sort` method. It requires a callback parameter that configures the sorting order

```js
SDK.subjects().sort(item => {
    // criteriums of sorting are available as functions on item
    item.distanceTo(geo, item.ASCENDING))
    // these criteriums can be chained
    item.lastName(item.ASCENDING).firstName(item.DESCENDING)
    // criteriums might have default parameters
    // `item.lastName()` is equivalent `item.lastName(item.ASCENDING)`
})
```

## ~~Paging~~

> **NOTE:** Pagination is currently not supported by the API itself. However some endpoints (customers, offices and recently used subjects) have a `limit` query parameter.

The user can limit the amount of responses by using the `.limit` method. To achieve paging, the user can either use the `.offset` method to manually skip a number of entities. For convenience, the user can also use the `.page` method which will deduce the offset based on the limit (=page size)

```js
SDK.subjects()
  .limit(10)
  .offset(10)
  .then(response => {
    // in addition to the regular properties on response, it will also additionally have
    // a new `paging` property with the following props:
    response.paging.size; // the amount of entities per page (=limit)
    response.paging.current; // the current page you're on
    response.paging.total; // the total amount of entities
    response.paging.pages; // the amount of pages
    response.paging.hasNext(); // check if there is a next page
    response.paging.hasPrevious(); // check if there is a previous page
    response.paging.next(); // start loading the next page. This will return a new Promise wich will resolve in a new response
    response.paging.previous(); // start loading the previous page. This will return a new Promise wich will resolve in a new response
  });

// and also
SDK.subjects()
  .limit(10)
  .page(3);

// is equivalent to
SDK.subjects()
  .limit(10)
  .offset(10 * (3 - 1));

// NOTE: the page() function requires the limit to be defined.
```

## Filters

It should be possible to filter the result set based on certain conditions.

```js
SDK.subjects().filter(item =>
  item.or(
    item
      .schedulable_at_office(["3"]) // chaining means AND implicitly
      .schedulable_with_contact(["1", "2"])
      .schedulable(),
    item.schedulable_at_office(["6"]).schedulable_with_contact(["4", "5"])
  )
);
// multiple filters can also be applied by chain-calling filter multiple times.
SDK.filter(cb).filter(cb); // chaining filter implies `AND`
// If the user wants multiple filters to be applied with OR semantics, they can use the method `.orFilter`
SDK.filter(cb).orFilter(cb);
```

> **NOTE**: `item.or` is currently not supported by the API and therefor should not (yet) be implemented.
> However, we leave this note to keep forward compatibility in mind.
> This also applies to the `.orFilter` method

## Creation

A new member of a collection can be created by using the `.new` method on the collection instead of calling it directly.
Such an action will be validated before actually attempting to perform it.
The user is required to confirm the action by calling the `.create` method on the record

```js
SDK.appointments
  .new({
    /* insert properties of appointment here */
  })
  .then(appointment => appointment.create(), validation_error => {})
  .then(
    response => {
      // The actual response as defined above goes here
    },
    response_error => {}
  );
```

> **NOTE**: adding validation is an optional feature that can be added on later without breaking backwards compatibility

> **NOTE**: validation (or other) errors returned by the API could/should be machine-readable and parsed into a practical format usable by the SDK user.

> **NOTE**: the above design regarding validation and normalisation of error responses also apply to `.update()` and `.replace()` calls on entities.

## External identifiers

Users of the SDK will often want to interact with entities that correspond to entities in their own applications.
These entities will be mapped by making use of external ID's.
This means that often, developers will query/interact with entities based on their external id rather than their (Skedify-internal) actual ID.
To make this use-case easier, ID strings can be overloaded with a schema to signify that an entity is reffered to by their external ID rather than the internal one.

```js
SDK.appointments("external://abc").then(response => response.data);
// instead of
SDK.appointments()
  .filter(item => item.external_id(["abc"]))
  .then(response => response.data);
```

By using an schema-like syntax, we make this mechanism extendable for multiple external ID's.
In other words, a Skedify entity might be known in multiple external system with varying ID's.
These systems could each assign their own external ID in their own namespace.

```js
// assume there is an appointment known in various external systems
const appointment = {
  id: "123", // internal Skedify ID
  external_id: "456", // currently only one external ID is supported, but later we might allow multiple:
  external_ids: {
    integration_one: "abc",
    integration_two: "def",
    integration_three: "ghi"
  }
};
// then this appointment would be addressable by using either of these
SDK.appointments("123");
SDK.appointments("external://456");
SDK.appointments("integration_one://abc");
SDK.appointments("integration_two://def");
SDK.appointments("integration_three://ghi");
```

We assume (by default) that there is a one-on-one mapping between internal entities' IDs and external entities.
The overloading of ID's adds extra checks that take this mapping into account.
However, other applications might have a use case for one-on-many mappings.
We allow method chaining to indicate a diversion from our default behaviour.

```js
// assume there are multiple appointments with the same external id
const appointment1 = {
    id: '123',
    external_id: 'abc'
}
const appointment2 = {
    id: '456',
    external_id: 'abc'
}
// then this appointment would be addressable by using either of these
SDK.appointments('external://abc').catch(error => {
    console.assert(error instanceof SDK.MoreThanOneFoundError)

    // Maybe we need error.data to be consistent
    // So that we can also use error.warnings, error.status, ...
    console.assert(error.alternatives ~= [appointment1, appointment2])
})
SDK.appointments('external://def').catch(error => {
    console.assert(error instanceof SDK.NoneFoundError)
})
```

Some external applications might not follow our assumption that there is a one-on-one relation between external ID's and Skedify entities.
In this case, it remains possible to interact with the collection as a whole and filter:

```js
SDK.appointments().filter(item => {
  item.external_id("abc");
});
```

We might provide utility functions on top of the shorthand for common use cases, but these can only be implemented once we have a strong understanding of what/how integrations will interact with the external ID's

```js
// depending on user demand, we COULD support some of these utilities:
// pretend like the first one is the correct one
SDK.appointments("external://abc")
  .firstOfMultiple()
  .then(result => {
    console.assert(result.data === appointment1);
  });
// pretend like the most recently updated one is the correct one
SDK.appointments("external://abc")
  .mostRecentlyUpdatedOfMultiple()
  .then(result => {
    console.assert(result.data === appointment1);
  });
// ... we should really wait and see what integrators want
```

## Diversions

For ease of use, some methods are exposed that are intentionally different from what the API exposes to make usage more obvious

### Overrides on subjects per office:

The endpoint `/offices/:oid/subject_settings` offers entities which have a seperate ID and a subject_id. These are not identical, so searching for the overrides on a specific subject "should" be done using a filter. However, it makes more sense to treat the subjectid as an ID, since the overrides will only every be looked up in that way directly.

```js
SDK.offices("officeid").subjectSettings("subjectid");
// instead of
SDK.offices("officeid")
  .subjectSettings()
  .filter(item => item.subject_id("subjectid"))
  .then(response => {
    if (response.data.length !== 0) {
      throw NotFoundError();
    }
  });
```

### Enterprise settings

The `enterprise_settings` endpoint exposes a collection which will only every have one member. This makes it confusing to use. Instead, treat it like a subresource of "enterprise"

```js
// TODO: know that the settings will return a collection and we still have to take the first argument behind the scenes
// TODO: There is only one enterprise, otherwise you need (enterprises(ID))
SDK.enterprise()
  .settings()
  .then(response => response.data);
// instead of
SDK.enterpriseSettings().then(response => response.data[0]);
```

### Timetable

Timetable is a special endpoint, where most of the "filters" are required. To emphasize this, the filters must be passed on with the original method call.

```js
SDK.timetable({
  subject: "subject id",
  location: "location id",
  contacts: ["contact id", "contact id"] // optional
});

// instead of
.filter()
SDK.timetable().filter(
item => {
  item.subject('subject id').location('location id')

  // optional
  item.contacts(['contact id 1', 'contact id 2'])
});
```

### Common actions on appointments

Since certain mutations are very common, there should be shorthands for those

```js
// Out of scope for now, because the Plugin won't accept appointments

// SDK.appointments('appointment id').accept('possibility id')
// SDK.acceptPossibility('possibility id')
// SDK.acceptPossibility({
//    ...extra_data_here
// })

SDK.appointments('appointment id').accept('possibility id')
// instead of
SDK.appointments('appointment id').then({ data } => {
    data.accepted_possibility_id = 'possibility id'
    data.state = 'accepted'
    data.save()
})
```

## Contributing

Use `npm run commit` when you want to commit a change.
