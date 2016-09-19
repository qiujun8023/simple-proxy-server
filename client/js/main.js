'use strict';

(function () {
  let proxy = angular.module('proxy', []);

  proxy.controller('main', function ($scope, $timeout, $http) {
    // 获取当前域名
    $scope.host = window.location.host;

    $scope.error_handle = function (data, status) {
      this.loading = false;

      if (!angular.isObject(data)) {
        data = {message: '服务器错误，请稍后再试'};
      }

      switch (status) {
        case 401:
          window.location.href = '/wechat/oauth';
          break;
        default:
          this.error = data.message;
          break;
      }
    };

    $scope.getList = function () {
      $scope.error = '';
      $scope.loading = true;
      $http.get('/action').success(function (data) {
        $scope.loading = false;
        $scope.list = data.list;
        $scope.user = data.user;
        if ($scope.list.length === 0) {
          $scope.error = '未找到相关记录，请添加';
        }
      }).error($scope.error_handle.bind($scope));
    };

    $scope.edit = function (item) {
      let edit_item;
      if (item) {
        edit_item = angular.copy(item);
        edit_item.method = 'POST';
      } else {
        edit_item = {
          method: 'PUT',
          target_type: 'HTTP',
          proxy_type: 'HTTP_ONLY',
        };
      }

      edit_item.error = '';
      $('.target_type.dropdown').dropdown('set selected', edit_item.target_type);
      $('.proxy_type.dropdown').dropdown('set selected', edit_item.proxy_type);
      $('.ui.modal').modal({
        blurring: true,
        closable: false,
        transition: 'drop',
      }).modal('show');
      $scope.edit_item = edit_item;
    };

    $scope.delete = function (item) {
      if (!confirm(`你确定要删除 ${item.mark} 吗？`)) {
        return false;
      }
      $scope.loading = true;
      $http.delete('/action', {
        params: {id: item.id},
      }).success(function () {
        $scope.loading = false;
        $scope.getList();
      }).error($scope.error_handle.bind($scope));
    };

    $('.ui.modal.form').form({
      fields: {
        mark: 'empty',
        domain: 'regExp[/^([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}$/]',
        target: 'regExp[/^((?:(?:25[0-5]|2[0-4]\\d|((1\\d{2})|([1-9]?\\d)))\\.){3}(?:25[0-5]|2[0-4]\\d|((1\\d{2})|([1-9]?\\d))))|(([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6})(:[0-9]{1,4})?$/]',
        hostname: 'regExp[/^([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}$/]',
        target_type: 'empty',
        proxy_type: 'empty',
      },
      onSuccess: function () {
        let edit_item = $scope.edit_item;
        edit_item.error = '';

        if (edit_item.proxy_type !== 'HTTP_ONLY') {
          if (!edit_item.key) {
            edit_item.error = 'HTTPS 私钥不能为空';
            $scope.$digest();
            return false;
          }
          if (!edit_item.cert) {
            edit_item.error = 'HTTPS 证书不能为空';
            $scope.$digest();
            return false;
          }
        }

        edit_item.loading = true;
        $http({
          url: '/action',
          method: edit_item.method,
          data: edit_item,
        }).success(function () {
          edit_item.loading = false;
          $('.ui.modal').modal('hide');
          $scope.getList();
        }).error($scope.error_handle.bind(edit_item));

        return false;
      },
    });

    $scope.getList();
  });

}).call(this);
