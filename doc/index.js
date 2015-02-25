/**
 * @ignore  =====================================================================================
 * @fileoverview vc-slider组件
 * @author  yangren.ry@taobao.com
 * @version 1.6.0
 * @ignore  created in 2015-02-25
 * @ignore  =====================================================================================
 */
var $ = require('node').all;
var Base = require('base');
var DD = require('dd');

var Util = {
    typeOf: function (value) {
        return toString.apply(value).replace(/^\[\w*\s*|\]$/ig, '');
    },
    isPercent: function (value) {
        return /^\d{1,3}%$/.test(value);
    },
    ascendSort: function (value) {
        return value.sort(function (a, b) {
            return a > b ? 1 : -1;
        });
    },
    collectionGarbage: function (obj) {
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                delete obj[p];
            }
        }
        return p = obj = obj.__proto__ = null;
    },
    parseIntByStep: function (value, step) {
        return parseInt(value / step) * step;
    },
    emptyEventFunc: function (e) { }
};

var keyDown = function ($handle, self, key) {
    var value = self.value_;
    var min = self.min_;
    var max = self.max_;
    var step = self.step_ > 0 ? self.step_ : 1;
    var type = self.type_;
    if (type === 'range' && Util.typeOf(value) !== 'Array') return;
    if (type === 'range') {
        var val = value[0];
        var val2 = value[1];
        var $slider_handle = self.$slider_handle;
        var $slider_handle2 = self.$slider_handle2;
    }
    switch (key) {
        case 37:
        // left
        case 40:
            // down
            switch (type) {
                case 'value':
                case 'min':
                    if (value > min) {
                        value = value - step;
                    }
                    break;
                case 'range':
                    switch ($handle) {
                        case $slider_handle:
                            if (val > min) {
                                val = val - step;
                                value = [val, val2];
                            }
                            break;
                        case $slider_handle2:
                            if (val2 > min) {
                                val2 = val2 - step;
                                if (val2 < val) {
                                    val2 = val;
                                }
                                value = [val, val2];
                            }
                            break;
                    }
                    break;
                case 'max':
                    if (value < max) {
                        value = value + step;
                    }
                    break;
            }
            break;
        case 38:
        // up
        case 39:
            // right
            switch (type) {
                case 'value':
                case 'min':
                    if (value < max) {
                        value = value + step;
                    }
                    break;
                case 'range':
                    switch ($handle) {
                        case $slider_handle:
                            if (val < max) {
                                val = val + step;
                                if (val > val2) {
                                    val = val2;
                                }
                                value = [val, val2];
                            }
                            break;
                        case $slider_handle2:
                            if (val2 < max) {
                                val2 = val2 + step;
                                value = [val, val2];
                            }
                            break;
                    }
                    break;
                case 'max':
                    if (value > min) {
                        value = value - step;
                    }
                    break;
            }
            break;
    }
    return value;
};

(function draggableDelegate() {
    var DDM = DD.DDM;
    var _left;
    var _right;
    var _top;
    var _bottom;
    var self = null;
    var $slider = null;
    var $handle = null;
    var $slider_track = null;
    var $slider_handle = null;
    var $slider_handle2 = null;
    var left;
    var bottom;
    var slider_width;
    var slider_height;
    var track_width;
    var track_height;
    var handle_width;
    var handle_height;
    var slider_offsetLeft;
    var slider_offsetTop;
    var readOnly;
    var disabled;
    var orientation;
    var type;
    var step;
    var min;
    var max;

    var g;
    var d;
    var s;
    var l;
    var r;
    var t;
    var b;

    DDM.on('dragstart', function (e) {
        $handle = e.drag.get('node');
        self = $handle.__self__;
        readOnly = self.readOnly_;
        disabled = self.disabled_;
        if (readOnly || disabled) return;
        self.$dragHandle = $handle;
        $slider = self.$slider;
        $slider_handle = self.$slider_handle;
        $slider_handle2 = self.$slider_handle2;
        $slider_track = self.$slider_track;
        orientation = self.orientation_;
        slider_width = $slider.outerWidth();
        slider_height = $slider.outerHeight();
        track_width = $slider_track.outerWidth();
        track_height = $slider_track.outerHeight();
        handle_width = $handle.outerWidth();
        handle_height = $handle.outerHeight();
        slider_offsetLeft = $slider.offset().left;
        slider_offsetTop = $slider.offset().top;
        type = self.type_;
        step = self.step_;
        min = self.min_;
        max = self.max_;

        if (type === 'range') {
            switch (orientation) {
                case 'horizontal':
                    switch ($handle) {
                        case $slider_handle:
                            left = parseInt($slider_handle2.css('left'));
                            break;
                        case $slider_handle2:
                            left = parseInt($slider_handle.css('left'));
                            break;
                    }
                    break;
                case 'vertical':
                    switch ($handle) {
                        case $slider_handle:
                            bottom = parseInt($slider_handle2.css('bottom'));
                            break;
                        case $slider_handle2:
                            bottom = parseInt($slider_handle.css('bottom'));
                            break;

                    }
                    break;
            }

            switch ($handle) {
                case $slider_handle:
                    $slider_handle2.css('z-index', 'auto');
                    $slider_handle.css('z-index', 1);
                    break;
                case $slider_handle2:
                    $slider_handle.css('z-index', 'auto');
                    $slider_handle2.css('z-index', 1);
                    break;
            }
        }

        //触发start事件
        self.fire('start');
    }).on('drag', function (e) {
        _left = parseInt(e.pageX - slider_offsetLeft - handle_width / 2);
        _right = track_width - _left;
        _top = parseInt(e.pageY - slider_offsetTop - handle_height / 2);
        _bottom = track_height - _top;

        switch (orientation) {
            case 'horizontal':
                if (step === 0) {
                    switch (type) {
                        case 'value':
                        case 'min':
                            self._pos(_left);
                            break;
                        case 'range':
                            switch ($handle) {
                                case $slider_handle:
                                    if (_left > left) {
                                        _left = left;
                                    }
                                    break;
                                case $slider_handle2:
                                    if (_left < left) {
                                        _left = left;
                                    }
                                    break;
                            }
                            self._pos(_left);
                            break;
                        case 'max':
                            self._pos(_right);
                            break;
                    }
                } else {
                    g = Math.abs((max - min) / track_width);
                    d = Math.abs(min / g);
                    s = parseInt(step / g + d);
                    switch (type) {
                        case 'value':
                        case 'min':
                            l = parseInt($handle.css('left'));
                            if (_left < l - s) {
                                self._pos(l - s);
                            }
                            if (_left > l + s) {
                                self._pos(l + s);
                            }
                            break;
                        case 'range':
                            l = parseInt($handle.css('left'));
                            switch ($handle) {
                                case $slider_handle:
                                    if (_left < left + s) {
                                        if (_left < l - s) {
                                            self._pos(l - s);
                                        }
                                        if (_left > l + s) {
                                            self._pos(l + s);
                                        }
                                    }
                                    break;
                                case $slider_handle2:
                                    if (_left > left - s) {
                                        if (_left < l - s) {
                                            self._pos(l - s);
                                        }
                                        if (_left > l + s) {
                                            self._pos(l + s);
                                        }
                                    }
                                    break;
                            }
                            break;
                        case 'max':
                            r = parseInt($handle.css('right'));
                            if (_right < r - s) {
                                self._pos(r - s);
                            }
                            if (_right > r + s) {
                                self._pos(r + s);
                            }
                            break;
                    }
                }
                break;
            case 'vertical':
                if (step === 0) {
                    switch (type) {
                        case 'value':
                        case 'min':
                            self._pos(_bottom);
                            break;
                        case 'range':
                            switch ($handle) {
                                case $slider_handle:
                                    if (_bottom > bottom) {
                                        _bottom = bottom;
                                    }
                                    break;
                                case $slider_handle2:
                                    if (_bottom < bottom) {
                                        _bottom = bottom;
                                    }
                                    break;
                            }
                            self._pos(_bottom);
                            break;
                        case 'max':
                            self._pos(_top);
                            break;
                    }
                } else {
                    g = Math.abs((max - min) / track_height);
                    d = Math.abs(min / g);
                    s = parseInt(step / g + d);
                    switch (type) {
                        case 'value':
                        case 'min':
                            b = parseInt($handle.css('bottom'));
                            if (_bottom < b - s) {
                                self._pos(b - s);
                            }
                            if (_bottom > b + s) {
                                self._pos(b + s);
                            }
                            break;
                        case 'range':
                            b = parseInt($handle.css('bottom'));
                            switch ($handle) {
                                case $slider_handle:
                                    if (_bottom < bottom + s) {
                                        if (_bottom < b - s) {
                                            self._pos(b - s);
                                        }
                                        if (_bottom > b + s) {
                                            self._pos(b + s);
                                        }
                                    }
                                    break;
                                case $slider_handle2:
                                    if (_bottom > bottom - s) {
                                        if (_bottom < b - s) {
                                            self._pos(b - s);
                                        }
                                        if (_bottom > b + s) {
                                            self._pos(b + s);
                                        }
                                    }
                                    break;
                            }
                            break;
                        case 'max':
                            t = parseInt($handle.css('top'));
                            if (_top < t - s) {
                                self._pos(t - s);
                            }
                            if (_top > t + s) {
                                self._pos(t + s);
                            }
                            break;
                    }
                }
                break;
        }

        //触发slide事件
        self.fire('slide');

    }).on('dragend', function () {
        //触发stop事件
        self.fire('stop');
        self = $slider = $slider_track = $handle = $slider_handle = $slider_handle2 = self.$dragHandle = null;
    });
})();

var Slider = Base.extend({
        initializer: function () {
            var self = this;
            // 配置
            var selector = self.selector_ = self.get('selector');
            var cssClass = self.cssClass_ = self.get('cssClass');
            var orientation = self.orientation_ = self.get('orientation');
            var min = self.min_ = self.get('min');
            var max = self.max_ = self.get('max');
            var value = self.value_ = self.get('value');
            var type = self.type_ = self.get('type');
            var step = self.step_ = Math.abs(self.get('step'));
            var animate = self.animate_ = self.get('animate');
            var readOnly = self.readOnly_ = self.get('readOnly');
            var disabled = self.disabled_ = self.get('disabled');
            var hidden = self.hidden_ = false;
            // 事件
            var slide = self.slide_ = self.get('slide') || Util.emptyEventFunc;
            var start = self.start_ = self.get('start') || Util.emptyEventFunc;
            var stop = self.stop_ = self.get('stop') || Util.emptyEventFunc;
            var change = self.change_ = self.get('change') || Util.emptyEventFunc;
            var create = self.create_ = self.get('create') || Util.emptyEventFunc;
            var destroy = self.destroy_ = self.get('destroy') || Util.emptyEventFunc;
            // 对象
            var $slider = self.$slider = self.get('$target');
            var $slider_handle = self.$slider_handle = $(selector.handle, $slider);
            self.$slider_handle.__self__ = self;
            var $slider_handle2 = self.$slider_handle2 = null;
            self.$dragHandle = null;
            var $slider_track = self.$slider_track = $(selector.track, $slider);
            var $slider_range = self.$slider_range = $(selector.range, $slider);

            switch (orientation) {
                case 'horizontal':
                    $slider.addClass(cssClass.horizontal);
                    switch (type) {
                        case 'value':
                            $slider.addClass(cssClass.horizontal_value);
                            break;
                        case 'min':
                            $slider.addClass(cssClass.horizontal_min);
                            break;
                        case 'range':
                            $slider.addClass(cssClass.horizontal_range);
                            $slider_handle2 = self.$slider_handle2 = $slider_handle.clone().appendTo($slider_track);
                            self.$slider_handle2.__self__ = self;
                            break;
                        case 'max':
                            $slider.addClass(cssClass.horizontal_max);
                            break;
                    }
                    break;
                case 'vertical':
                    $slider.addClass(cssClass.vertical);
                    switch (type) {
                        case 'value':
                            $slider.addClass(cssClass.vertical_value);
                            break;
                        case 'min':
                            $slider.addClass(cssClass.vertical_min);
                            break;
                        case 'range':
                            $slider.addClass(cssClass.vertical_range);
                            $slider_handle2 = self.$slider_handle2 = $slider_handle.clone().appendTo($slider_track);
                            self.$slider_handle2.__self__ = self;
                            break;
                        case 'max':
                            $slider.addClass(cssClass.vertical_max);
                            break;
                    }
                    break;
            }

            self.percent_ = parseInt(value / (max - min) * 100);

            // 交互初始化
            new DD.Draggable({
                node: $slider_handle,
                move: false
            });
            if (type === 'range') {
                new DD.Draggable({
                    node: $slider_handle2,
                    move: false
                });
                $slider_handle.on('focus', function () {
                    self.$dragHandle = $slider_handle;
                });
                $slider_handle2.on('focus', function () {
                    self.$dragHandle = $slider_handle2;
                });
            }
            $slider.on('keydown', function (e) {
                var readOnly = self.readOnly_;
                var disabled = self.disabled_;
                if (readOnly || disabled) return;
                var key = e.which;
                self.value_ = keyDown(self.$dragHandle, self, key);
                self._value(self.value_);
            });
            self._accessible();
            self._value(value);
            self._disabled(disabled);

            // 绑定事件
            self.on('create', function (e) {
                create.call(this, e);
            }).on('start', function (e) {
                start.call(this, e);
            }).on('slide', function (e) {
                slide.call(this, e);
            }).on('stop', function (e) {
                stop.call(this, e);
            }).on('change', function (e) {
                change.call(this, e);
            }).on('destroy', function (e) {
                destroy.call(this, e);
            });

            //触发create事件
            self.fire('create');

        },
        _accessible: function (scope) {
            var self = this;
            var $slider = self.$slider;
            var $slider_handle = self.$slider_handle;
            var $slider_handle2 = self.$slider_handle2;
            var readOnly = self.readOnly_;
            var disabled = self.disabled_;
            var step = self.step_;
            var hidden = self.hidden_;
            var type = self.type_;

            if (scope === undefined) {
                // 无障碍属性
                $slider.attr({
                    'role': 'slider',
                    'aria-readOnly': readOnly,
                    'aria-disabled': disabled,
                    'aria-step': step,
                    'aria-hidden': hidden
                });
                $slider_handle.attr('tabindex', 0);
                if (type === 'range') {
                    $slider_handle2.attr('tabindex', 0);
                }
                return;
            }
            var min = self.min_;
            var max = self.max_;
            var percent = self.percent_;
            var value = self.value_;

            if (percent >= 0 && percent <= 100) {

                // 无障碍属性
                switch (scope) {
                    case 'value':
                        $slider.attr({
                            'aria-valuemin': min,
                            'aria-valuemax': max,
                            'aria-valuenow': value,
                            'aria-valuetext': value,
                            'data-percent': percent
                        });
                        break;
                    case 'readOnly':
                        $slider.attr({
                            'aria-readOnly': readOnly
                        });
                        break;
                    case 'disabled':
                        $slider.attr({
                            'aria-disabled': disabled
                        });
                        break;
                    case 'step':
                        $slider.attr({
                            'aria-step': step
                        });
                        break;
                    case 'hidden':
                        $slider.attr({
                            'aria-hidden': hidden
                        });
                        break;
                }
            }
        },
        _step: function (step) {
            var self = this;
            if (Util.typeOf(step) !== 'Number') return;
            self.step_ = Math.abs(step);
            self._accessible('step');
        },
        _readOnly: function (value) {
            var self = this;
            switch (value) {
                case true:
                    self.readOnly_ = true;
                    break;
                case false:
                    self.readOnly_ = false;
                    break;
            }
            self._accessible('readOnly');
        },
        _disabled: function (value) {
            var self = this;
            var $slider = self.$slider;
            var cssClass = self.cssClass_;
            switch (value) {
                case true:
                    $slider.addClass(cssClass.disabled);
                    self.disabled_ = true;
                    break;
                case false:
                    $slider.removeClass(cssClass.disabled);
                    self.disabled_ = false;
                    break;
            }
            self._accessible('disabled');
        },
        _pos: function (pos) {
            var self = this;
            var $handle = self.$dragHandle;
            if ($handle === null) return;
            var $slider_handle = self.$slider_handle;
            var $slider_handle2 = self.$slider_handle2;
            var handle_pos;
            var handle2_pos;
            var $slider = self.$slider;
            var $slider_track = self.$slider_track;
            var $slider_range = self.$slider_range;
            var orientation = self.orientation_;
            var type = self.type_;

            var max = self.max_;
            var min = self.min_;

            var g;
            var d;

            var direction;
            var reverse;
            var track;
            var scope;
            var diff;

            var val;
            var val2;
            var value;

            var handle;

            switch (orientation) {
                case 'horizontal':
                    track = $slider_track.outerWidth();
                    scope = 'width';
                    handle = $handle.outerWidth();
                    diff = $slider.outerWidth() - handle;
                    switch (type) {
                        case 'value':
                        case 'min':
                        case 'range':
                            direction = 'left';
                            reverse = 'right';
                            break;
                        case 'max':
                            direction = 'right';
                            reverse = 'left';
                            break;
                    }
                    break;
                case 'vertical':
                    track = $slider_track.outerHeight();
                    scope = 'height';
                    handle = $handle.outerHeight();
                    diff = $slider.outerHeight() - handle;
                    switch (type) {
                        case 'value':
                        case 'min':
                        case 'range':
                            direction = 'bottom';
                            reverse = 'top';
                            break;
                        case 'max':
                            direction = 'top';
                            reverse = 'bottom';
                            break;
                    }
                    break;
            }

            g = Math.abs((max - min) / track);
            d = Math.abs(min / g);
            $handle.css(direction, pos);

            switch (type) {
                case 'range':
                    handle_pos = parseInt($slider_handle.css(direction));
                    handle2_pos = parseInt($slider_handle2.css(direction));
                    switch ($handle) {
                        case $slider_handle:
                            $slider_range
                                .css(direction, 'auto')
                                .css(reverse, track - handle2_pos + handle / 2)
                                .css(scope, handle2_pos - pos);
                            break;
                        case $slider_handle2:
                            $slider_range
                                .css(reverse, 'auto')
                                .css(direction, handle_pos + handle / 2)
                                .css(scope, pos - handle_pos);
                            break;
                    }
                    val = parseInt((handle_pos - d) * g);
                    val = val < min ? min : val;
                    val2 = parseInt((handle2_pos - d) * g);
                    val2 = val2 > max ? max : val2;
                    value = [val, val2];
                    break;
                default:
                    $slider_range.css(scope, pos);
                    value = parseInt((pos - d) * g);
                    break;
            }

            switch (true) {
                case pos < 0:
                    self._pos(0);
                    break;
                case pos > diff:
                    self._pos(diff);
                    break;
                default:
                    self._value(value);
                    break;
            }

        },
        _value: function (value) {
            var self = this;
            var percent;
            var orientation = self.orientation_;
            var type = self.type_;
            var $slider_track = self.$slider_track;
            var $slider_handle = self.$slider_handle;
            var $slider_handle2 = self.$slider_handle2;
            var $slider_range = self.$slider_range;
            var max = self.max_;
            var min = self.min_;
            var step = self.step_;
            var typeOfValue;

            var g;
            var d;
            var pos;
            var pos2;

            var direction;
            var track;
            var scope;

            var val;
            var val2;
            var _val;

            var handle;

            switch (true) {
                case Util.typeOf(value) === 'String':
                    if (Util.isPercent(value)) {
                        percent = parseInt(value.split('%')[0]);
                        percent = percent > 100 ? 100 : percent;
                        typeOfValue = 1;
                        break;
                    } else return;
                    break;
                case Util.typeOf(value) === 'Number':
                    switch (type) {
                        case 'range':
                            step = step > 0 ? step : 1;
                            val = Util.parseIntByStep(value, step);
                            val2 = Util.parseIntByStep(value, step);
                            if (val < min) val = min;
                            if (val2 > max) val2 = max;
                            value = [val, val2];
                            typeOfValue = 2;
                            break;
                        default:
                            if (value < min) value = min;
                            if (value > max) value = max;
                            typeOfValue = 0;
                            break;
                    }
                    break;
                case Util.typeOf(value) === 'Array':
                    value = Util.ascendSort(value).slice(0, 2);
                    step = step > 0 ? step : 1;
                    val = Util.parseIntByStep(value[0], step);
                    switch (type) {
                        case 'range':
                            val2 = Util.parseIntByStep(value[1], step);
                            if (val < min) val = min;
                            if (val2 > max) val2 = max;
                            value = [val, val2];
                            typeOfValue = 2;
                            break;
                        default:
                            value = val;
                            typeOfValue = 0;
                            break;
                    }
                    break;
            }

            switch (orientation) {
                case 'horizontal':
                    track = $slider_track.outerWidth();
                    scope = 'width';
                    switch (type) {
                        case 'value':
                        case 'min':
                            direction = 'left';
                            break;
                        case 'range':
                            direction = 'left';
                            handle = $slider_handle.outerWidth();
                            break;
                        case 'max':
                            direction = 'right';
                            break;
                    }
                    break;
                case 'vertical':
                    track = $slider_track.outerHeight();
                    scope = 'height';
                    switch (type) {
                        case 'value':
                        case 'min':
                            direction = 'bottom';
                            break;
                        case 'range':
                            direction = 'bottom';
                            handle = $slider_handle.outerHeight();
                            break;
                        case 'max':
                            direction = 'top';
                            break;
                    }
                    break;
            }

            g = Math.abs((max - min) / track);
            d = Math.abs(min / g);

            switch (typeOfValue) {
                case 0:
//                    if (value === min || value === max) return;
                    pos = parseInt(value / g + d);
                    self.value_ = value;
                    self.percent_ = parseInt(pos / track * 100);
                    $slider_range.css(scope, pos);
                    break;
                case 1:
                    if (type === 'range') {
                        pos = parseInt($slider_handle.css(direction));
                        pos2 = pos + (percent / 100 * track);
                        val = parseInt((pos - d) * g);
                        val2 = parseInt((pos2 - d) * g);
                        val = Util.parseIntByStep(val, step);
                        val2 = Util.parseIntByStep(val2, step);
                        _val = percent / 100 * max;
                        if (val < min) val = min;
                        if (val2 > max) val2 = max;
                        if (val2 - val < _val) {
                            val = _val - val2 + val;
                        }
                        if (val2 === _val) {
                            val = _val - val2;
                        }
//                        if (val === min || val === max) return;
//                        if (val2 === min || val2 === max) return;
                        pos = parseInt(val / g + d);
                        pos2 = parseInt(val2 / g + d);
                        self.value_ = [val, val2];
                        self.percent_ = percent;
                        $slider_handle2.css(direction, pos2);
                        $slider_range.css(direction, pos + handle / 2).css(scope, pos2 - pos);
                    } else {
                        pos = percent / 100 * track;
                        _val = parseInt((pos - d) * g);
//                        if (_val === min || _val === max) return;
                        self.value_ = _val;
                        self.percent_ = percent;
                        $slider_range.css(scope, pos);
                    }
                    break;
                case 2:
//                    if (val === min || val === max) return;
//                    if (val2 === min || val2 === max) return;
                    pos = parseInt(val / g + d);
                    pos2 = parseInt(val2 / g + d);
                    self.value_ = value;
                    self.percent_ = parseInt((pos2 - pos) / track * 100);
                    $slider_handle2.css(direction, pos2);
                    $slider_range.css(direction, pos + handle / 2).css(scope, pos2 - pos);
                    break;
            }

            $slider_handle.css(direction, pos);

            self._accessible('value');

            //触发change事件
            self.fire('change');
        },
        hide: function () {
            var self = this;
            self.hidden_ = true;
            self._accessible('hidden');
            self.$slider.hide();
        },
        show: function () {
            var self = this;
            self.hidden_ = false;
            self._accessible('hidden');
            self.$slider.show();
        },
        setter: function (prop, value) {
            var self = this;
            switch (prop) {
                case 'value':
                    if (self.readOnly_) return;
                    self._value(value);
                    break;
                case 'readOnly':
                    self._readOnly(value);
                    break;
                case 'disabled':
                    self._disabled(value);
                    break;
                case 'step':
                    self._step(value);
                    break;
            }
        },
        getter: function (prop) {
            var self = this;
            var result;
            switch (prop) {
                case 'value':
                    result = self.value_;
                    break;
                case 'readOnly':
                    result = self.readOnly_;
                    break;
                case 'disabled':
                    result = self.disabled_;
                    break;
                case 'step':
                    result = self.setp_;
                    break;
            }
            return result;
        },
        destroy: function () {
            var self = this;
            var $slider = self.$slider;
            self.fire('destroy');

            // 删除DOM节点
            $slider.remove();
            // 深度清空
            return Util.collectionGarbage(self);
        }
    },
    {
        ATTRS: {
            $target: {
                value: '',
                getter: function (v) {
                    return $(v);
                }
            },
            selector: {
                value: {
                    handle: '.vc-slider-handle',
                    track: '.vc-slider-track',
                    range: '.vc-slider-range'
                }
            },
            cssClass: {
                value: {
                    horizontal_value: 'vc-slider-horizontal-value',
                    horizontal_min: 'vc-slider-horizontal-min',
                    horizontal_range: 'vc-slider-horizontal-range',
                    horizontal_max: 'vc-slider-horizontal-max',
                    horizontal: 'vc-slider-horizontal',
                    vertical_value: 'vc-slider-vertical-value',
                    vertical_min: 'vc-slider-vertical-min',
                    vertical_range: 'vc-slider-vertical-range',
                    vertical_max: 'vc-slider-vertical-max',
                    vertical: 'vc-slider-vertical',
                    disabled: 'vc-slider-disabled'
                }
            },
            orientation: {
                value: 'horizontal'
            },
            min: {
                value: 0
            },
            max: {
                value: 100
            },
            value: {
                value: 0
            },
            type: {
                value: 'value'
            },
            step: {
                value: 0
            },
            animate: {
                value: false
            },
            readOnly: {
                value: false
            },
            disabled: {
                value: false
            }
        }
    });

Slider.prototype.__defineSetter__('value', function (value) {
    var self = this;
    self._value(value);
});
Slider.prototype.__defineSetter__('readOnly', function (value) {
    var self = this;
    self._readOnly(value);
});
Slider.prototype.__defineSetter__('disabled', function (value) {
    var self = this;
    self._disabled(value);
});
Slider.prototype.__defineSetter__('step', function (value) {
    var self = this;
    self._step(value);
});
Slider.prototype.__defineGetter__('value', function () {
    var self = this;
    return self.value_;
});
Slider.prototype.__defineGetter__('readOnly', function () {
    var self = this;
    return self.readOnly_;
});
Slider.prototype.__defineGetter__('disabled', function () {
    var self = this;
    return self.disabled_;
});
Slider.prototype.__defineGetter__('step', function () {
    var self = this;
    return self.step_;
});

module.exports = Slider;




