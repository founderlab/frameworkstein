
## [Unreleased]

## [0.14.2]
 - Fixed some bugs
 - Readonly works on model detail pages

## [0.14.0]
 - Removed react-quill due to size issues.
 - You can now specify a custom input component for a field with the `InputComponent` option. Give it any component that you would give to a redux-form field.

## [0.13.0]
 - Assorted bug fixes 

## [0.12.0]
 - Update to redux-form 6

## [0.11.0]
 - Update fl-react-utils / fl-redux-utils apis

## [0.10.2]
 - Fixes for model loading
 - password and hidden field types added

## [0.10.0]
 - Code style switched to camelCase for variables. 
 - Frameworkstein initial release.

## [0.5.0]
 - A whole new style and a bunch of config options added.

## [0.4.2]
 - Bugfix in fetchRelated. 
 - Option to specify a query to filter which related models will be fetched (named, unsurprisingly, `filter`) 

## [0.4.1]
 - Quill editor is supported. 
 - Added the `input` option for form fields. 
 - To use quill set it like so: `input: 'rich'`

## [0.4.0]
 - Pagination added; field.inline setting renamed to listEdit

## [0.3.0]
 - State shape changes for pagination

## [0.2.0]
 - belongsTo relations can be saved
