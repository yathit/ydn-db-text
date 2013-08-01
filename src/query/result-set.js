// Copyright 2013 YDN Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Indexed entry.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */

goog.provide('ydn.db.text.ResultSet');
goog.require('ydn.db.KeyRange');
goog.require('ydn.db.text.QueryEntry');
goog.require('ydn.db.text.ResultEntry');



/**
 * Result set.
 *
 * @constructor
 * @param {ydn.db.schema.fulltext.Catalog} ft_schema full text schema.
 * @param {Array.<ydn.db.text.QueryEntry>} query_tokens query tokens.
 * @param {number} limit Maximum number of satisfactory results.
 * @param {number} threshold Threshold score of a result to consider as
 * satisfactory.
 * @implements {ydn.db.schema.fulltext.ResultSet}
 * @struct
 */
ydn.db.text.ResultSet = function(ft_schema, query_tokens, limit, threshold) {
  /**
   * @protected
   * @type {ydn.db.schema.fulltext.Catalog}
   */
  this.ft_schema = ft_schema;
  /**
   * @protected
   * @type {Array.<ydn.db.text.QueryEntry>}
   */
  this.query_tokens = query_tokens || [];
  /**
   * @protected
   * @type {Array.<ydn.db.text.ResultEntry>}
   */
  this.results = [];
  /**
   * Maximum number of satisfactory results.
   * @type {number}
   * @protected
   */
  this.limit = limit;
  /**
   * Threshold score of a result to consider as satisfactory.
   * @type {number}
   * @protected
   */
  this.threshold = threshold;
  /**
   * Lookup iteration lap lap.
   * @type {number}
   * @private
   */
  this.lap_ = 0;
  for (var i = 0; i < this.query_tokens.length; i++) {
    this.query_tokens[i].resultset = this;
  }
};


/**
 * @inheritDoc
 */
ydn.db.text.ResultSet.prototype.nextLookup = function(cb) {
  if (this.lap_ > 3) {
    throw new ydn.debug.error.InvalidOperationException('too many loopup laps');
  }
  var index_name = this.lap_ == 1 ? 'keyword' : 'value';
  var store_name = this.ft_schema.getName();
  for (var j = 0; j < this.query_tokens.length; j++) {
    var token = this.query_tokens[j];
    var key = index_name == 'keyword' ?
        token.getKeyword() : token.getValue();
    if (goog.isDefAndNotNull(key)) {
      var key_range = this.lap_ == 2 ? ydn.db.KeyRange.starts(key) :
          ydn.db.KeyRange.only(key);
      cb(store_name, index_name, key_range, this.query_tokens[j]);
    }
  }
  this.lap_++;
};


/**
 * Count number of results.
 * @param {boolean=} opt_only_satisfactory count only result of score larger
 * than or equal to threadhold value.
 * @return {number} number of results.
 */
ydn.db.text.ResultSet.prototype.count = function(opt_only_satisfactory) {
  if (opt_only_satisfactory && !isNaN(this.threshold)) {
    var cnt = 0;
    for (var i = 0; i < this.results.length; i++) {
      if (this.results[i].getScore() >= this.threshold) {
        cnt++;
      } else {
        break;
      }
    }
    return cnt;
  } else {
    return this.results.length;
  }
};


/**
 * Get list of store name involved in this catalog.
 * @return {!Array.<string>}
 */
ydn.db.text.ResultSet.prototype.getStoreList = function() {
  var store_names = [this.ft_schema.getName()];
  for (var i = 0; i < this.ft_schema.count(); i++) {
    var source_name = this.ft_schema.index(i).getStoreName();
    if (store_names.indexOf(source_name) == -1) {
      store_names.push(source_name);
    }
  }
  return store_names;
};


/**
 * @inheritDoc
 */
ydn.db.text.ResultSet.prototype.addResult = function(query, results) {
  for (var i = 0; i < results.length; i++) {
    var result = results[i];
    var entry = new ydn.db.text.ResultEntry(
        /** @type {ydn.db.text.QueryEntry} */ (query), result);
    this.results.push(entry);
  }
  if (this.lap_ >= 3) {
    return false; // no more lookup
  }
  // return this.count(true) <= this.limit;
  return true;
};


/**
 * Collect non-redundant result with consolidate ranking.
 * @return {Array}
 */
ydn.db.text.ResultSet.prototype.collect = function() {
  var arr = [];
  return arr;
};

