/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';


var EX, hasOwn = Function.call.bind(Object.prototype.hasOwnProperty);

/*
simple: nur sync, nur einfache Erzeugungen
Erzeugungsstrategie mit angeben z.B. JSON parsen
nachschlagen oder erzeugungsfunktion intern immer mit callback damit nur
    1 Mechanismus für vorzeitig bestehenden Wert liefern, aber sync erwartet,
    dass sein callback synchron beliefert wird sonst fehler.
configurator gibt minifkt. zurück die core aufruft mit args aus
    eigenschaften ihrer selbst
*/


EX = function getOrAddKey(opts) {
  if (hasOwn(opts.dict, opts.key)) { return opts.dict[opts.key]; }
  return EX.impatientlyMake(opts);
};


EX.async = function (opts, receiverCallback) {
  if (hasOwn(opts.dict, opts.key)) {
    return receiverCallback(null, opts.dict[opts.key]);
  }
  return EX.impatientlyMake(opts);
};


EX.stripErrArg = function (realDestCb, destPreArgs, err, val) {
  if (err) {
    throw new Error('Error occurred but callback unfit to receive it: ' +
      String(realDestCb).substr(0, 64));
  }
  
};


EX.ocn = function () { return Object.create(null); };


EX.cfg = function preconfigure(opts) {
  var func = (opts.deliverAsync ? EX.async : EX),
    slot1 = (String(opts.slot1 || '') || 'slot1'),
    slot2 = String(opts.slot2 || '');
  opts = Object.assign(EX.ocn(), opts);
  if (slot2) {
    return function getOrAddKey_preconfigured_2slots(arg1, arg2, cb) {
      opts[slot1] = arg1;
      opts[slot2] = arg2;
      return func(opts, cb);
    };
  }
  return function getOrAddKey_preconfigured_1slot(arg1, cb) {
    opts[slot1] = arg1;
    return func(opts, cb);
  };
};


EX.impatientlyMake = function (opts) {
  var entry;
  entry = EX.makeNewEntry(opts);
  if (entry.ready) { return entry.value; }
  throw new Error(EX.cannotMake(opts,
    'Blueprint not suitable for sync invocation'));
};


EX.cannotMake = function (opts, msg) {
  return (msg + ', how=<' + String(opts.how) + '>, config ID=<' +
    String(opts.id) + '>');
};


EX.makeNewEntry = function (opts) {
  switch (opts.how) {
  case 'dflt':
  case undefined:
    return { ready: true, value: opts.dflt };
    break;
  case 'ocn':
  case '{null}':
    return { ready: true, value: Object.create(null) };
  case 'array':
  case '[]':
    return { ready: true, value: [] };
  case 'obj':
  case '{}':
    return { ready: true, value: {} };
  case 'undef':
    return { ready: true, value: undefined };
  case 'json':
  case 'JSON':
    return { ready: true, value: JSON.parse(opts.dflt) };
  case 'returns':
    return { ready: true, value: opts.facFunc.call(null, opts); };
  case 'errValCb':
    return { ready: false, receipe: opts.factory.bind(null, opts); };
  }
  throw new Error(EX.cannotMake(opts, 'Unsupported blueprint type'));
};































module.exports = getOrAddKey;
