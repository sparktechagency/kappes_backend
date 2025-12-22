```
ubuntu@ip-172-31-30-225:~$ hostname
ip-172-31-30-225
ubuntu@ip-172-31-30-225:~$ whoami
ubuntu
ubuntu@ip-172-31-30-225:~$ ^C
ubuntu@ip-172-31-30-225:~$ ipconfig
Command 'ipconfig' not found, did you mean:
  command 'iwconfig' from deb wireless-tools (30~pre9-13.1ubuntu4)
  command 'hipconfig' from deb hipcc (5.2.3-12)
  command 'iconfig' from deb ipmiutil (3.1.9-3)
  command 'ifconfig' from deb net-tools (2.10-0.1ubuntu4.4)
Try: sudo apt install <deb name>
ubuntu@ip-172-31-30-225:~$ ssh-keygen -t rsa -b 4096 -C "asifaowadud@gmail.com"
Generating public/private rsa key pair.
Enter file in which to save the key (/home/ubuntu/.ssh/id_rsa):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/ubuntu/.ssh/id_rsa
Your public key has been saved in /home/ubuntu/.ssh/id_rsa.pub
The key fingerprint is:
SHA256:N4LBr1Z6uLfT1PpsQ91L0/H3AqYE9HrHYUuA9h4bMTE asifaowadud@gmail.com
The key's randomart image is:
+---[RSA 4096]----+
|         .E.     |
|     .  + +.     |
|      oo o +     |
|       +. = +  . |
|      . S+oO + .+|
|       =.o*.O .o=|
|      = .= * .. =|
|     . oo +.o ...|
|      ...o oo. . |
+----[SHA256]-----+
ubuntu@ip-172-31-30-225:~$ cat ~/.ssh/id_rsa
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
ubuntu@ip-172-31-30-225:~$ cat ~/.ssh/id_rsa_pub
cat: /home/ubuntu/.ssh/id_rsa_pub: No such file or directory
ubuntu@ip-172-31-30-225:~$ cd /.ssh
-bash: cd: /.ssh: No such file or directory
ubuntu@ip-172-31-30-225:~$ cd .ssh
ubuntu@ip-172-31-30-225:~/.ssh$ ls
authorized_keys  id_rsa  id_rsa.pub
ubuntu@ip-172-31-30-225:~/.ssh$ cat ~/.ssh/id_rsa.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCqtGoScmKobRNPS/Jtzxa8yUI/fM62eFpgcgNeiZv6SHa91nOu4QE3ND2K6/btnr/QxoYFiqc4Pp6CIhv+iP2+Xq0APWuUEK/TydpKvxf3s3RtPcf4VjFg1WYUW7kkUZaGrQxoz8hMehtaxzDjpM+QCKKWAYDc57kgj+ejH/PGABvhs5vdJkVtCTpPdMyFHDo4UjM8tp/7D3HcID8Bxceca1AAWrO6gTwNWTggRZTGyNZQbSlRzLmHrzu1Dx2UQ7HVMXgZs8MrR2e2M139wIXGo+uNo/funP4epXAazcF9sfeRR/QHDwo2Ocj74EUy5EJ09PF6GaYirW+wFB8fDWG4AQqy3gXqktZ8uDRrpdUNun1LUo9ZKVRdLt0LSMp4+TDQs1UP3USC5vxQEZVNnnfav7snGFQlE+dfs9Qku4PDRUdz8f37EKrMYLXWyFh5WQ7T7QUhiiSPDdoE3yLaOknJIFvKVazPe1gJnaAsIl6fvcMOUEcZJeBNCfk3eocloOOrKJxBobNjY2hk/7Rn7yOmMQNuyTJJcew6iLQT2//pjaw2HyYJb9E7VvXOCAN/9Hf3isicpq4EHPY4/B3w/h/hNjOtlf2PfDf8U4jjnjnZz6OcaoVLWNqKdiRqFfmYRgoEWM2rQCwC5mb+6dSUb5/mUp7zw9+G8oSbK69bHf721Q== asifaowadud@gmail.com
ubuntu@ip-172-31-30-225:~/.ssh$

```

path: https://github.com/sparktechagency/kappes_backend/settings/secrets/actions

```
Repository secrets
Name
VPS_HOST
VPS_SSH_KEY
VPS_USER

```
