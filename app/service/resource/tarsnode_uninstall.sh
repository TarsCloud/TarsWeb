$ref =
if [ps -ef | grep tarsnode ~= './tarsnode --config=../config/tarsnode.conf']; then
    echo 'Tars node installed success'
else
    echo 'Tars node installed failed'
fi
