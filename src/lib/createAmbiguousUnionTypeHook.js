import avro from 'avsc';
import utils from 'util';
import isEqual from 'lodash.isequal';
import debug from 'debug';

const log = debug('iris:createAmbiguousUnionTypeHook');

function AmbiguousUnionType(attrs, opts) {
  avro.types.LogicalType.call(this, attrs, opts);
}

utils.inherits(AmbiguousUnionType, avro.types.LogicalType);

// eslint-disable-next-line no-underscore-dangle
AmbiguousUnionType.prototype._inferType = function inferType(val) {
  const types = this.getUnderlyingType().getTypes();

  const validType = types.find(type => type.isValid(val));

  if (validType) {
    return validType;
  }

  throw new Error(`invalid value: ${val}`);
};

// eslint-disable-next-line no-underscore-dangle
AmbiguousUnionType.prototype._toValue = function toValue(data) {
  // eslint-disable-next-line no-underscore-dangle
  const branchName = this._inferType(data).getName(true);

  return branchName === 'null' ? null : { [branchName]: data };
};

// eslint-disable-next-line no-underscore-dangle
AmbiguousUnionType.prototype._fromValue = function fromValue(val) {
  return val === null ? null : val[Object.keys(val)[0]];
};

export default function createAmbiguousUnionTypeHook() {
  const checked = [];

  const beenChecked = attrs =>
    checked.length > 0 && checked.every(checkedAttrs => isEqual(checkedAttrs, attrs));

  // eslint-disable-next-line consistent-return
  return (attrs, opts) => {
    // Let this fall through so that the default type is used
    if (Array.isArray(attrs) && !beenChecked(attrs)) {
      checked.push(attrs);

      log(`Checking attrs ${attrs}`);

      return new AmbiguousUnionType(attrs, opts);
    }
  };
}
