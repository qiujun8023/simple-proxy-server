// Generated by CoffeeScript 1.10.0
(function() {
  var proxy;

  proxy = angular.module('proxy', []);

  proxy.controller('main', function($scope, $timeout, $http) {
    $scope.check = function(data, status) {
      this.loading = false;
      data || (data = {
        code: -1
      });
      switch (data.code) {
        case -2:
          return window.location.href = '/wechat/oauth';
        case -1:
          return this.error = data.msg || '服务器错误，请稍后再试';
      }
    };
    $scope.list = function() {
      $scope.error = '';
      $scope.loading = true;
      return $http.get('/action').success(function(data, status) {
        var ref, ref1;
        $scope.loading = false;
        $scope.data = (ref = data.data) != null ? ref.list : void 0;
        $scope.user = (ref1 = data.data) != null ? ref1.user : void 0;
        if ($scope.data.length === 0) {
          $scope.error = '未找到相关记录，请添加';
        }
        return $timeout(function() {
          return $('.help.circle.icon').popup();
        });
      }).error(function(data, status) {
        return $scope.check.call($scope, data);
      });
    };
    $scope.edit = function(item) {
      var editItem;
      if (item) {
        editItem = angular.copy(item);
        editItem.method = 'POST';
      } else {
        editItem = {
          method: 'PUT'
        };
      }
      editItem.error = '';
      $('.ui.modal').modal({
        blurring: true,
        closable: false,
        transition: 'drop'
      }).modal('show');
      return $scope.editItem = editItem;
    };
    $scope["delete"] = function(item) {
      if (!confirm("你确定要删除 " + item.mark + " 吗？")) {
        return;
      }
      $scope.loading = true;
      return $http["delete"]("/action", {
        params: {
          id: item.id,
          domain: item.domain
        }
      }).success(function(data, status) {
        $scope.loading = false;
        return $scope.list();
      }).error(function(data, status) {
        return $scope.check.call($scope, data);
      });
    };
    $('.ui.modal.form').form({
      fields: {
        'mark': 'empty',
        'domain': 'regExp[/^([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}$/]',
        'target': "regExp[/^((?:(?:25[0-5]|2[0-4]\\d|((1\\d{2})|([1-9]?\\d)))\\.){3}(?:25[0-5]|2[0-4]\\d|((1\\d{2})|([1-9]?\\d))))|(([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6})(:[0-9]{1,4})?$/]"
      },
      onSuccess: function() {
        var editItem;
        editItem = $scope.editItem;
        editItem.error = '';
        editItem.loading = true;
        $http({
          url: '/action',
          method: editItem.method,
          data: editItem
        }).success(function(data, status) {
          editItem.loading = false;
          $('.ui.modal').modal('hide');
          return $scope.list();
        }).error(function(data, status) {
          return $scope.check.call(editItem, data);
        });
        return false;
      }
    });
    return $scope.list();
  });

}).call(this);
