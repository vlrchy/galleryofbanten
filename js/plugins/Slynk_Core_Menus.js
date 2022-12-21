//=============================================================================
// Slynk Core - Menus
// Slynk_Core_Menus.js
//=============================================================================

var Imported = Imported || {};
Imported.Slynk_Core_Menus = true;

var Slynk = Slynk || {};
Slynk.Core = Slynk.Core || {};
Slynk.Core.Menus = Slynk.Core.Menus || {};

//=============================================================================
/*:
 * @plugindesc v1.00 A plugin that aims to greatly reduce the complexity for
 * displaying simple menus.
 * @author Slynk
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin should greatly reduce the complexity for displaying simple menus.
 * If you want to show just a list of options, it shouldn't take 40 lines of code.
 * That's ridiculous...
 *
 * There are also some quality of life enhancements:
  * 1. There's simply no reason that you should only be able to have one background
  * snapshot. Now you may call SceneManager.snapForBackground() as often as you'd
  * like, and it will store a stack of background images to display as you change scenes.
 *
 * 2. There's an annoy bug with columned windows in which if you try to move the cursor
 * down when there's nothing directly below your cursor, it won't scroll, even if there's
 * another row still! I have applied the fix to the Window_Selectable definition so it
 * should be fixed for everything.
 *
 * ============================================================================
 * Command Maps - A simpler way to construct menus
 * ============================================================================
 *
 * A command map is constructed via a simple object with string to function
 * mapping. The string will be the option displayed in the menu that is
 * displayed and the function will be called when that option is selected.
 *
 *
 * Example:

    SceneManager.pushSimple({
        "Remove One": function () {
            var item = $gameParty.lastItem();
            $gameParty.loseItem(item, 1, true);

            SceneManager.pop();
        },

        "Remove All": function () {
            var item = $gameParty.lastItem();
            var count = $gameParty.numItems(item);

            $gameParty.setLastItem(item);
            $gameParty.loseItem(item, count, true);

            SceneManager.pop();
        },
        "Cancel": function () {
            SceneManager.pop();
        }
        }, 'center|top');
 *
 * The follow anchors are available for aligning the command map:
 * center|left|right|top|bottom
 *
 * You can combine anchors by separating them with a pipe '|' e.g.:
 * 'top|left' or 'center|bottom'
 *
 */
//=============================================================================

//=============================================================================
// Generic command map window
//=============================================================================

function Window_Generic_Command_Map(commandMap, alignment) {
    this.initialize(commandMap, alignment);
}

Window_Generic_Command_Map.prototype = Object.create(Window_Command.prototype);
Window_Generic_Command_Map.prototype.constructor = Window_Generic_Command_Map;

Window_Generic_Command_Map.prototype.initialize = function(commandMap, alignment) {
    this.commandMap = commandMap;
    Window_Command.prototype.initialize.call(this, 0, 0);
    this.updatePlacement(alignment);
    this.open();
};

Window_Generic_Command_Map.prototype.updatePlacement = function(alignment) {
    if(alignment) {
        var anchors = alignment.toLowerCase().split('|');
        for (var index in anchors) {
            var anchor = anchors[index].trim();
            switch (anchor) {
                case 'center':
                    this.x = (Graphics.boxWidth - this.width) / 2;
                    this.y = (Graphics.boxHeight - this.height) / 2;
                    break;
                case 'left':
                    this.x = 0;
                    break;
                case 'right':
                    this.x = Graphics.boxWidth - this.width;
                    break;
                case 'top':
                    this.y = 0;
                    break;
                case 'bottom':
                    this.y = Graphics.boxHeight - this.height;
                    break;
                default:
                    console.error('Slynk Core Menus -- Cannot align command map to "%s"', anchor);
            }
        }
    }
};

Window_Generic_Command_Map.prototype.makeCommandList = function() {
    for(var command in this.commandMap) {
        this.addCommand(command, command);
    }
};

//=============================================================================
// Generic command map scene
//=============================================================================

function Scene_Generic_Command_Map(commandMap, alignment) {
    this.initialize(commandMap, alignment);
}

Scene_Generic_Command_Map.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Generic_Command_Map.prototype.constructor = Scene_Generic_Command_Map;

Scene_Generic_Command_Map.prototype.initialize = function(commandMap, alignment) {
    this.commandMap = commandMap;
    this.alignment = alignment;
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Generic_Command_Map.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
};

Scene_Generic_Command_Map.prototype.stop = function() {
    Scene_MenuBase.prototype.stop.call(this);
    this._commandWindow.close();
};

Scene_Generic_Command_Map.prototype.createBackground = function() {
    Scene_MenuBase.prototype.createBackground.call(this);
    this.setBackgroundOpacity(128);
};

Scene_Generic_Command_Map.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_Generic_Command_Map(this.commandMap, this.alignment);

    var containsCancel = false;
    for(var command in this.commandMap) {
        this._commandWindow.setHandler(command, this.commandMap[command].bind(this));
        containsCancel = containsCancel || command.toLocaleUpperCase() === TextManager.cancel.toLocaleUpperCase();
    }

    if(!containsCancel) {
        this._commandWindow.setHandler('cancel',   this.popScene.bind(this));
    }

    this.addWindow(this._commandWindow);
};

//=============================================================================
// SceneManager Overrides
//=============================================================================

SceneManager.sceneForCommandMap = function(commandMap, alignment){
    return new Scene_Generic_Command_Map(commandMap, alignment);
};

/**
 * A new function that takes a command map.
 */
SceneManager.pushSimple = function (commandMap, alignment) {

    if(this._scene.hasOwnProperty('commandMap') && this._scene.hasOwnProperty('alignment')) {
        this._stack.push({'commandMap': this._scene['commandMap'], 'alignment': this._scene['alignment']});
    } else {
        this._stack.push(this._scene.constructor);
    }

    this._nextScene = new Scene_Generic_Command_Map(commandMap, alignment);

    if (this._scene) {
        this._scene.stop();
    }
};

SceneManager.push = function(sceneClass) {
    if(this._scene.hasOwnProperty('commandMap') && this._scene.hasOwnProperty('alignment')) {
        this._stack.push({'commandMap': this._scene['commandMap'], 'alignment': this._scene['alignment']});
    } else {
        this._stack.push(this._scene.constructor);
    }

    this.goto(sceneClass);
};

SceneManager.goto = function(sceneClass) {
    if (sceneClass) {
        if(sceneClass.hasOwnProperty('commandMap') && sceneClass.hasOwnProperty('alignment')) {
            this._nextScene = new Scene_Generic_Command_Map(sceneClass['commandMap'], sceneClass['alignment']);
        } else {
            this._nextScene = new sceneClass();
        }
    }
    if (this._scene) {
        this._scene.stop();
    }
};

/**
 * Overriding for infinite background bitmap functionality.
 */
SceneManager.snapForBackground = function() {
    this._scene.constructor._backgroundBitmap = this._backgroundBitmap;

    this._backgroundBitmap = this.snap();
    this._backgroundBitmap.blur();
};

/**
 * Overriding for infinite background bitmap functionality.
 */
SceneManager.pop = function() {
    if (this._stack.length > 0) {
        var scene = this._stack.pop();
        if(scene._backgroundBitmap) {
            this._backgroundBitmap = scene._backgroundBitmap;
        }

        this.goto(scene);
    } else {
        this.exit();
    }
};

//=============================================================================
// Window_Selectable Overrides
//=============================================================================

/**
 * Override to fix an annoying bug in which multi columned item lists won't
 * scroll down all the way.
 */
Window_Selectable.prototype.cursorDown = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (index < maxItems || (wrap && maxCols === 1)) {
        this.select(Math.min((index + maxCols), maxItems - 1));
    }
};

