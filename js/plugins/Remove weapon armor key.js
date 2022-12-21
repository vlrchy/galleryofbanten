Window_ItemCategory.prototype.maxCols = function() {
    return 4;
};
Window_ItemCategory.prototype.makeCommandList = function() {
    this.addCommand(TextManager.item,    'item');

};