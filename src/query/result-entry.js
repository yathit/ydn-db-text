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
 * @fileoverview Query entry.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */


goog.provide('ydn.db.text.ResultEntry');
goog.require('ydn.db.text.IndexEntry');



/**
 * Entry restored from the database.
 * @param {ydn.db.text.QueryEntry} query
 * @param {string} store_name inverted index schema.
 * @param {string} key_path inverted index schema.
 * @param {IDBKey} primary_key inverted index schema.
 * @param {string} value inverted index schema.
 * @param {string} keyword normalized value of original word.
 * @param {Array.<number>=} opt_positions score.
 * @param {number=} opt_score score.
 * @constructor
 * @extends {ydn.db.text.IndexEntry}
 * @struct
 */
ydn.db.text.ResultEntry = function(query, store_name, key_path, primary_key,
    value, keyword, opt_positions, opt_score) {
  goog.base(this, store_name, key_path, primary_key, value,
      keyword, opt_positions, opt_score);
  /**
   * @type {ydn.db.text.QueryEntry}
   */
  this.query = query;
};
goog.inherits(ydn.db.text.ResultEntry, ydn.db.text.IndexEntry);


/**
 * @param {ydn.db.text.QueryEntry} query
 * @param {Object} json
 * @return {ydn.db.text.ResultEntry}
 */
ydn.db.text.ResultEntry.fromJson = function(query, json) {
  var store_name = json['storeName'];
  var primary_key = json['primaryKey'];
  var keyword = json['keyword'];
  var score = json['score'];
  var positions = json['positions'];
  var key_path = json['keyPath'];
  var value = json['value'];
  return new ydn.db.text.ResultEntry(query, store_name, key_path, primaryKey,
      value, keyword, positions, score);
};


if (goog.DEBUG) {
  /**
   * @inheritDoc
   */
  ydn.db.text.ResultEntry.prototype.toString = function() {
    return ['ResultEntry', this.store_name, this.primary_key,
      this.value].join(':');
  };
}

