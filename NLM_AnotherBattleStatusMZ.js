/*==========================================================================
 NLM_AnotherBattleStatusMZ.js
----------------------------------------------------------------------------
 (C)2025-2026 NoLimits
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.0.0 2025/07/01 初版
 1.1.0 2026/04/06 HDLayout.js競合対策、パラメータ：X座標で右端指示可能に
============================================================================*/

/*:
 * @target MZ
 * @plugindesc 戦闘ステータス追加プラグイン (v1.1.0)
 * @author ノリミツ (NoLimits)
 * @url https://github.com/nolimits-tukool
 * 
 * @param wx
 * @text ウィンドウX座標
 * @desc ウィンドウX座標（マイナス値だと最右端からの距離となる）　（デフォルト：-1）
 * @type number
 * @min -99999
 * @default -1
 * 
 * @param wy
 * @text ウィンドウY座標
 * @desc ウィンドウY座標（デフォルト：146）
 * @type number
 * @default 146
 * 
 * @param str
 * @text 置き換え文字列
 * @desc 名前部分に置き換わる文字列（制御文字使用可。空欄だと顔画像を拡大）（デフォルト：\fs[22]\n[\v[10]] （アクター名表示))
 * @type string
 * @default \fs[22]\n[\v[10]]
 * 
 * @param actorVarId
 * @text アクターIDが入る変数
 * @desc 戦闘アクターコマンド入力時において選択中のアクターIDが入る変数ID（デフォルト：10）（戦闘時以外では値が取れません）
 * @type variable
 * @default 10
 * 
 * @param scriptVarId
 * @text スクリプト値が入る変数
 * @desc 下記スクリプト値が入る変数ID（デフォルト：なし）　　　　（戦闘アクターコマンド入力時以外では値が取れません）
 * @type variable
 * @default 0
 * 
 * @param script
 * @parent scriptVarId
 * @text スクリプト(上級者向け)
 * @desc 戦闘アクターコマンド入力直前に実行されるスクリプト計算式。変数値はv[]で置換。a が利用可（上述変数IDを設定時のみ実行)
 * @type multiline_string
 * 
 * @param tone
 * @text ウインドウ背景カラー
 * @desc 以下でウインドウ背景カラーのRGB値を設定　　　　　　　　　（デフォルト値だとピンク色）
 * 
 * @param toneR
 * @parent tone
 * @text カラーR
 * @desc ウインドウ背景カラー赤（-255～255）（デフォルト：255）
 * @type number
 * @min -255
 * @max 255
 * @default 255
 * 
 * @param toneG
 * @parent tone
 * @text カラーG
 * @desc ウインドウ背景カラー緑（-255～255）（デフォルト：30）
 * @type number
 * @min -255
 * @max 255
 * @default 30
 * 
 * @param toneB
 * @parent tone
 * @text カラーB
 * @desc ウインドウ背景カラー青（-255～255）（デフォルト：140）
 * @type number
 * @min -255
 * @max 255
 * @default 140
 * 
 * 
 * @help
 * 
 * 【RPGツクールMZ専用プラグイン】（v1.1.0）
 * 
 * 戦闘アクターコマンド入力時にステータスウインドウをもう一つ追加表示します
 * 
 * ステータスは選択中の一人分のみの表示で、タイムゲージは表示されません
 * （TP表示の有無はデータベースの システム1 の設定が反映されます）
 * 名前の部分は、パラメータ設定で任意の文字列に置き換えが可能です
 * 文字列には制御文字（\fs[], \c[], \v[]など）が使用可能です
 * (長い文字列でウインドウから はみ出す時は\fs[]でフォントを小さくして下さい)
 * 簡易的な一行情報ウインドウとしても利用できるかも知れません
 * アクターコマンド入力終了で、ウインドウが閉じます
 * 
 *  v1.1にて HDLayout.js との競合を回避し、パラメータのX座標で マイナス値 を
 * 　入力することで UI幅に関わらず 最右端からの距離で入力できるようになりました
 * 
 * プラグインコマンドはありません
 * 利用規約はMITライセンスの通りです
 */

(() => {
    "use strict";

    const pluginName = "NLM_AnotherBattleStatusMZ";
    const NABSparam  = PluginManager.parameters(pluginName);

    function Window_NLMbattleStatus() { // 新規ウインドウ作成
        this.initialize(...arguments);
    }

    Window_NLMbattleStatus.prototype = Object.create(Window_BattleStatus.prototype);
    Window_NLMbattleStatus.prototype.constructor = Window_NLMbattleStatus;

    const _WBS_initialize = Window_BattleStatus.prototype.initialize;
    Window_NLMbattleStatus.prototype.initialize = function(rect) {
        _WBS_initialize.apply(this, arguments);
        this.cursorVisible = false;
        this.openness = 150;
    };

    Window_NLMbattleStatus.prototype.updateTone = function() { // ウインドウカラー変更
        this.setTone(NABSparam.toneR, NABSparam.toneG, NABSparam.toneB);
    };

    Window_NLMbattleStatus.prototype.itemHeight = function() {
        return this.innerHeight;
    };

    Window_NLMbattleStatus.prototype.maxItems = function() {
        return 1;
    };

    Window_NLMbattleStatus.prototype.maxCols = function() {
        return 1;
    };

    Window_NLMbattleStatus.prototype.drawItem = function() {
        const index = this._index > 0 ? this._index : 0;
        this.drawItemImage(index);
        this.drawItemStatus(index);
    };

    Window_NLMbattleStatus.prototype.drawItemStatus = function(index) {
        const actor = this.actor(index);
        const rect  = this.itemRect(0);
        const nameY = this.nameY(rect);
        const stateIconX = this.stateIconX(rect);
        const stateIconY = this.stateIconY(rect);
        const basicGaugesX = 0; // v1.1で変更（HDlayout.jsでのgaugeOffsetXを無効化）
        const basicGaugesY = this.basicGaugesY(rect) + 8;
        this.NABStext(actor, rect.x, nameY); // タイムゲージ・名前と置き換えでテキスト表示
        this.placeStateIcon(actor, stateIconX, stateIconY);
        this.placeBasicGauges(actor, basicGaugesX, basicGaugesY);
    };

    Window_NLMbattleStatus.prototype.NABStext = function(actor, x, y) {
        const text  = NABSparam.str;
        if (text) this.drawTextEx(text, x, y, this.itemWidth());
    };

    Window_NLMbattleStatus.prototype.faceRect = function() {
        const extra = NABSparam.str ? -8 : 20; 
        const rect  = this.itemRect(0);
        rect.height = this.nameY(rect) + this.gaugeLineHeight() / 2 - rect.y + extra;
        return rect;
    };

    Window_NLMbattleStatus.prototype.refresh = function() {
        this.contents.clear();
        this.hideAdditionalSprites();
        this.drawItem();
    };

    const _SB_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _SB_createAllWindows.call(this);
        this.createNLMstatusWindow();
        this._NLMstatusWindow.hide();
    };

    Scene_Battle.prototype.createNLMstatusWindow = function() {
        const rect = this.NLMstatusWindowRect();
        const NLMstatusWindow = new Window_NLMbattleStatus(rect);
        this.addWindow(NLMstatusWindow);
        this._NLMstatusWindow = NLMstatusWindow;
    };

    Scene_Battle.prototype.NLMstatusWindowRect = function() {
        const extra = -8;
        const ww = Sprite_Gauge.prototype.bitmapWidth() + 18;
        const wh = this.windowAreaHeight() + extra;
        const px = Number(NABSparam.wx) || 0;  // v1.1で追加
        const rx = Graphics.boxWidth - ww + 9; // v1.1で追加
        const wx = (px < 0 ? rx : 0) + px;     // v1.1で改変
        const wy = Number(NABSparam.wy) || 0;
        return new Rectangle(wx, wy, ww, wh);
    };

    const _SB_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function() {
        _SB_startActorCommandSelection.apply(this, arguments);
        this.NABSrefresh();
    };

    Scene_Battle.prototype.NABSrefresh = function() {
        const actor = BattleManager.actor();
        if (actor) {
            const varId  = NABSparam.scriptVarId;
            const script = NABSparam.script;
            this._NLMstatusWindow.selectActor(actor);
            $gameVariables.setValue(NABSparam.actorVarId, actor._actorId);
            if (varId && script) {
                const formula = this.NABSevalFormula(script, actor)
                $gameVariables.setValue(varId, formula);
            }
            this._NLMstatusWindow.refresh();
            this._NLMstatusWindow.show();
            this._NLMstatusWindow.open();
        }
    };

    Scene_Battle.prototype.NABSevalFormula = function(script, a) {
        try {
            const v = $gameVariables._data; // 変数値に置き換え
            const V = $gameVariables._data;
            const value = eval(script);
            return isNaN(value) ? 0 : value;
        } catch (e) {
            return 0;
        }
    };

    const _SB_endCommandSelection = Scene_Battle.prototype.endCommandSelection;
    Scene_Battle.prototype.endCommandSelection = function() {
        _SB_endCommandSelection.apply(this, arguments);
        this._NLMstatusWindow.hide();
    };
})();