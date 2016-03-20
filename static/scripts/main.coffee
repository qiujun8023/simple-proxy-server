proxy = angular.module 'proxy', []

proxy.controller 'main', ($scope, $timeout, $http) ->
    $scope.check = (data, status) ->
        this.loading = false
        data ||= code:-1
        switch data.code
            when -2
                window.location.href = '/wechat/oauth'
            when -1
                this.error = data.msg || '服务器错误，请稍后再试'

    $scope.list = ->
        $scope.error   = ''
        $scope.loading = true
        $http.get '/action'
        .success (data, status) ->
            $scope.loading = false
            $scope.data    = data.data?.list
            $scope.user    = data.data?.user
            if $scope.data.length is 0
                $scope.error = '未找到相关记录，请添加'
            $timeout ->
                $('.help.circle.icon').popup()
        .error (data, status) ->
            $scope.check.call $scope, data

    $scope.edit = (item) ->
        if item
            editItem = angular.copy item
            editItem.method = 'POST'
        else
            editItem = method:'PUT'
        editItem.error = ''
        $('.ui.modal').modal
            blurring  : true
            closable  : false
            transition: 'drop'
        .modal('show')
        $scope.editItem = editItem

    $scope.delete = (item) ->
        if !confirm("你确定要删除 #{item.mark} 吗？") then return
        $scope.loading = true
        $http.delete "/action",
            params:
                id    : item.id
                domain: item.domain
        .success (data, status) ->
            $scope.loading = false
            $scope.list()
        .error (data, status) ->
            $scope.check.call $scope, data

    $('.ui.modal.form').form
        fields:
            'mark'  : 'empty'
            'domain': 'regExp[/^([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}$/]'
            'target': "regExp[/^((?:(?:25[0-5]|2[0-4]\\d|((1\\d{2})|([1-9]?\\d)))\\.){3}(?:25[0-5]|2[0-4]\\d|((1\\d{2})|([1-9]?\\d))))|(([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6})(:[0-9]{1,4})?$/]"
        onSuccess: ->
            editItem = $scope.editItem
            editItem.error   = ''
            editItem.loading = true
            $http
                url   : '/action'
                method: editItem.method
                data  : editItem
            .success (data, status) ->
                editItem.loading = false
                $('.ui.modal').modal('hide')
                $scope.list()
            .error (data, status) ->
                $scope.check.call editItem, data
            return false

    $scope.list()