# 本地环境搭建
微信开发时不可能每次修改完都上传到服务器看效果，所以使用服务器反向代理的方式来实现本地调试  
需要一台外网linux服务器时，可以这样实现微信开发的本地调试：是的，微信只支持80号端口，但本地80号端口已然被电信封了，如何解决这个问题捏？我们需要做一个端口转发： 
1. 首先：把该linux服务器占用80号端口的服务关闭；
2. 打开服务器的远程转发功能，在/etc/ssh/sshd_config文件末尾加入一句：GatewayPorts yes（sudo vim /etc/ssh/sshd_config）然后重启SSH：sudo service sshd restart
3. 利用xshell工具设置远程linux服务器端口转发（如下图所示），将图中红色箭头所指的地方换成服务器IP，将会监听80号端口，并将收到的信息转发给本地的80（自定义即可）端口。（mac终端自带ssh）
4. ssh -R 80:localhost:3000 root@wechatdev.yourdomain.com (这句话的意思是，把发到wechatdev.yourdomain.com:80的流量转发到本地的9001端口)
5. 在hosts文件中添加服务器的IP和域名， x.x.x.x yourdomain


## 坑
- 公众号白名单绑定，访问微信都IP多有多个，都要加到白名单，不然会报40164的错