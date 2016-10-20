/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var dict = Object.create(null),
  hasOwn = Function.call.bind(Object.prototype.hasOwnProperty);

function chk() { console.log(hasOwn(dict, 'foo'), dict); }

chk();                //= `false {}`
dict.foo = 'bar';
chk();                //= `true { foo: 'bar' }`
dict.foo = undefined;
chk();                //= `true { foo: undefined }`
delete dict.foo;
chk();                //= `false {}`
