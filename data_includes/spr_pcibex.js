// このスクリプトは Sherry Yong Chen さんが GitHub に公開してくれているスクリプトを参考に作りました。
// https://github.com/linguistsherry/SPR

// PCIbexではスクリプトのエラーを検出してくれる機能があります。
  // 実際に実験を行なうときには下のコマンドでその機能をオフにする必要があります。
  // このコマンドをコメントアウトすればエラー検出機能が働きます。
PennController.DebugOff()

/////////////////////////////////////
// 実験全体に関する一般的な設定

// 呈示順序
// pseudo-randomization: 必ずターゲット刺激とフィラー刺激を交互に出現させたい場合（ターゲット刺激1とターゲット刺激2の連続も許さない場合）
var shuffleSequence = seq(
  "intro",
  sepWith(
    "sep",
    seq(
      "practice",
      "prac-end",
      rshuffle(
        "filler",
        shuffle(
          "nomwh_a",
          "nomwh_b",
          "nomwh_c",
          "nomwh_d",
          "adjwh_a",
          "adjwh_b"
        )
      )
    )
  )
);

// ターゲット刺激1とターゲット刺激2の連続は許す場合（必ずしも全てのターゲット刺激とフィラー刺激が交互に出現しなくてもいい場合）
  // var shuffleSequence = seq("intro", sepWith("sep", seq("practice", "prac-end", rshuffle("filler", shuffle("nomwh_a", "nomwh_b", "nomwh_c", "nomwh_d"), shuffle("adjwh_a", "adjwh_b")))));

var practiceItemTypes = ["practice"];

// デフォルト設定
var defaults = [
  "Separator", {
      transfer: 1000,
      normalMessage: "次の文が表示されるまでお待ちください。",
      errorMessage: "間違いです。次の文が表示されるまでお待ちください。"
  },
  "DashedSentence", {
      mode: "self-paced reading"
  },
  "Question", {
      hasCorrect: false
  },
  "Message", {
      hideProgressBar: true
  },
  "Form", {
      hideProgressBar: true,
      continueOnReturn: true,
      saveReactionTime: true
  }
];
/////////////////////////////////////

/////////////////////////////////////
// 休憩の挿入
  // 下記のiはitem単位。
  // つまり，introやsep，prac-endも一つとしてカウントされる

  // ただし，sepqith()内でカウントされるため，introだけは別カウント
  // i > 1を設定しておくことで，introの直後に挿入されることを避けられる

  // prac-endまでを含めて14（sepwith()内はそれぞれのitemの直後にsepが挿入されるため）
  // なので，i = 15だと一つ目のターゲット文の直後にDynamicElementが挿入され，
  // i = 16 だとその直後のsepの後に挿入される。

  // 下の例だと，i = 22 となっており，刺激文5文目のsep直後に挿入される

function modifyRunningOrder(ro) {
  for (var i = 0; i < ro.length; ++i) {
    if (i % 22 == 0 && i > 0) {
      ro[i].push(new DynamicElement("Message", {
        html: "<p>必要であれば、休憩を取ってください。</p> <br><br>",
        transfer: "click",
        continueMessage: "次に進むにはここをクリックしてください。"
      },
      true,
    ));
  }
}
return ro;
}
/////////////////////////////////////

/////////////////////////////////////
// 実験刺激

var items = [

    // New in Ibex 0.3-beta-9. You can now add a 'SendResults' controller in your shuffle
    // sequence to send results before the experiment has finished. This is NOT intended to allow
    // for incremental sending of results -- you should send results exactly once per experiment.
    // However, it does permit additional messages to be displayed to participants once the
    // experiment itself is over. If you are manually inserting a 'SendResults' controller into
    // the shuffle sequence, you must set the 'manualSendResults' configuration variable to 'true', since
    // otherwise, results are automatically sent at the end of the experiment.
    //
    //["sr", "SendResults", { }],

    ["sep", "Separator", { }],

    // New in Ibex 0.3-beta19. You can now determine the point in the experiment at which the counter
    // for latin square designs will be updated. (Previously, this was always updated upon completion
    // of the experiment.) To do this, insert the special 'SetCounter' controller at the desired
    // point in your running order. If given no options, the counter is incremented by one. If given
    // an 'inc' option, the counter is incremented by the specified amount. If given a 'set' option,
    // the counter is set to the given number. (E.g., { set: 100 }, { inc: -1 })
    //
    //["setcounter", "SetCounter", { }],

    // NOTE: You could also use the 'Message' controller for the experiment intro (this provides a simple
    // consent checkbox).

    ["intro", "Form", {
      html:{
        include: "example_intro.html"
      },
      validators: {
        age: function(s){
          if(s.match(/^\d+$/))
          return true;
          else return "Bad value for \u2018age\u2019";
        }
      }
     }
    ],

    //練習文

    ["practice", "DashedSentence", {s: "+ この文は 実験に 慣れて いただくための 練習文です。"}],

    ["practice", "DashedSentence", {s: "+ この文は 参加者の 皆さんが 実験に 慣れて いただくために 作られた 練習文です。"},
    "Question", {q: "「慣れる」", as: ["参加者", "この文"]}],

    ["practice", "DashedSentence", {s: "+ 兄は 肉を 焼き、 弟は お寿司を 握っている。"},
    "Question", {q: "「握る」", as: ["弟", "兄"]}],

    ["practice", "DashedSentence", {s: "+ 前田は 高橋を 叱ったと 白井が 先生に チクった。"},
    "Question", {q: "「叱る」", as: ["前田", "白井"]}],

    ["practice", "DashedSentence", {s: "+ 柴崎は 若くて エネルギッシュな 作家である 木村が 面白い 小説を 書いたと 雑誌で 知った。"},
    "Question", {q: "「知る」", as: ["柴崎", "木村"]}],


    ["prac-end", "Message", {html: "これで練習は終了です。それでは，本番を始めましょう！"}],

    // 刺激文 8文
      // 2つの実験
        // 実験1："nomwh_"（2要因4条件：1-4番）
        // 実験2："adjwh_"（1要因2条件：5-8番）
    // フィラー文 8文

    // 文の並べ方はどのようになっていても問題ない（少なくとも一つのセットがまとまって並んでいれば問題ないことは確認済み）
    // もしかしたらセット（同じ番号の文）ごとにまとまっていなくても問題はないかも。ただしこちらは未確認

    [["nomwh_a",1],
    "DashedSentence", {s: "+ どの生徒が 先生が 教室で マンガを 読んでいたか 教頭に 言ったの？"},
    "Question", {q: "「読む」", as: ["先生", "生徒"]}],

    [["nomwh_b",1],
    "DashedSentence", {s: "+ どの生徒が 先生が 教室で マンガを 読んでいたと 教頭に 言ったの？"},
     "Question", {q: "「読む」", as: ["先生", "生徒"]}],

    [["nomwh_c",1],
    "DashedSentence", {s: "+ その生徒が 先生が 教室で マンガを 読んでいたか 教頭に 言ったの？"},
     "Question", {q: "「読む」", as: ["先生", "生徒"]}],

    [["nomwh_d",1],
    "DashedSentence", {s: "+ その生徒が 先生が 教室で マンガを 読んでいたと 教頭に 言ったの？"},
     "Question", {q: "「読む」", as: ["先生", "生徒"]}],

    [["nomwh_a",2],
    "DashedSentence", {s: "+ どの学生が 教授が 食堂で うどんを 注文していたか 調理師に 聞いたの？"},
     "Question", {q: "「注文する」", as: ["教授", "学生"]}],

    [["nomwh_b",2],
    "DashedSentence", {s: "+ どの学生が 教授が 食堂で うどんを 注文していたと 調理師に 聞いたの？"},
     "Question", {q: "「注文する」", as: ["教授", "学生"]}],

    [["nomwh_c",2],
    "DashedSentence", {s: "+ その学生が 教授が 食堂で うどんを 注文していたか 調理師に 聞いたの？"},
     "Question", {q: "「注文する」", as: ["教授", "学生"]}],

    [["nomwh_d",2],
    "DashedSentence", {s: "+ その学生が 教授が 食堂で うどんを 注文していたと 調理師に 聞いたの？"},
     "Question", {q: "「注文する」", as: ["教授", "学生"]}],

    [["nomwh_a",3],
    "DashedSentence", {s: "+ どの児童が 担任が 運動場で ゴミを 拾っていたか 校長先生に 聞いたの？"},
     "Question", {q: "「拾う」", as: ["担任", "児童"]}],

    [["nomwh_b",3],
    "DashedSentence", {s: "+ どの児童が 担任が 運動場で ゴミを 拾っていたと 校長先生に 聞いたの？"},
     "Question", {q: "「拾う」", as: ["担任", "児童"]}],

    [["nomwh_c",3],
    "DashedSentence", {s: "+ その児童が 担任が 運動場で ゴミを 拾っていたか 校長先生に 聞いたの？"},
     "Question", {q: "「拾う」", as: ["担任", "児童"]}],

    [["nomwh_d",3],
    "DashedSentence", {s: "+ その児童が 担任が 運動場で ゴミを 拾っていたと 校長先生に 聞いたの？"},
     "Question", {q: "「拾う」", as: ["担任", "児童"]}],

    [["nomwh_a",4],
    "DashedSentence", {s: "+ どの役員が 保護者が 会見で 真実を 語っていたか 広報に 教えたの？"},
     "Question", {q: "「語る」", as: ["保護者", "役員"]}],

    [["nomwh_b",4],
    "DashedSentence", {s: "+ どの役員が 保護者が 会見で 真実を 語っていたと 広報に 教えたの？"},
     "Question", {q: "「語る」", as: ["保護者", "役員"]}],

    [["nomwh_c",4],
    "DashedSentence", {s: "+ その役員が 保護者が 会見で 真実を 語っていたか 広報に 教えたの？"},
     "Question", {q: "「語る」", as: ["保護者", "役員"]}],

    [["nomwh_d",4],
    "DashedSentence", {s: "+ その役員が 保護者が 会見で 真実を 語っていたと 広報に 教えたの？"},
     "Question", {q: "「語る」", as: ["保護者", "役員"]}],

    [["adjwh_a",5],
    "DashedSentence", {s: "+ どの保育園で その保護者は 息子が お家で 離乳食を 食べてくれたと 保育士に 言ったの？"},
     "Question", {q: "「言う」", as: ["保護者", "息子"]}],

    [["adjwh_b",5],
    "DashedSentence", {s: "+ どの保護者が その保育園で 息子が お家で 離乳食を 食べてくれたと 保育士に 言ったの？"},
     "Question", {q: "「言う」", as: ["保護者", "息子"]}],

    [["adjwh_a",6],
    "DashedSentence", {s: "+ どのファミレスで その捜査官は 容疑者が レジ付近で スタッフを 襲ったか 目撃者に 聞いたの？"},
     "Question", {q: "「聞く」", as: ["捜査官", "容疑者"]}],

    [["adjwh_b",6],
    "DashedSentence", {s: "+ どの捜査官が そのファミレスで 容疑者が レジ付近で スタッフを 襲ったか 目撃者に 聞いたの？"},
     "Question", {q: "「聞く」", as: ["捜査官", "容疑者"]}],

    [["adjwh_a",7],
    "DashedSentence", {s: "+ どの店舗で そのレジ係は 常連客が 駐車場で チンピラを 注意したと 調査員に 言ったの？"},
     "Question", {q: "「言う」", as: ["レジ係", "常連客"]}],

    [["adjwh_b",7],
    "DashedSentence", {s: "+ どのレジ係が その店舗で 常連客が 駐車場で チンピラを 注意したと 調査員に 言ったの？"},
     "Question", {q: "「言う」", as: ["レジ係", "常連客"]}],

    [["adjwh_a",8],
    "DashedSentence", {s: "+ どの飲み会で その友人は 妻が ライブで 観客を 盛り上げていたと 家主に 教えたの？"},
     "Question", {q: "「教える」", as: ["友人", "妻"]}],

    [["adjwh_b",8],
    "DashedSentence", {s: "+ どの友人が その飲み会で 妻が ライブで 観客を 盛り上げていたと 家主に 教えたの？"},
     "Question", {q: "「教える」", as: ["友人", "妻"]}],

    ["filler",
    "DashedSentence", {s: "+ どの医師に 患者が 病室で 薬を 返したか 看護師は 知っている。"},
     "Question", {q: "「返す」", as: ["患者", "看護師"]}],

    ["filler",
    "DashedSentence", {s: "+ どの女子大生に 占い師が 裏部屋で 嘘を 信じ込ませたと 友達は 知っているの？"},
     "Question", {q: "「知っている」", as: ["友達", "占い師"]}],

    ["filler",
    "DashedSentence", {s: "+ どの幼児に そのお姉さんが 幼稚園で クッキーを 渡したか 園長は 知っているの？"},
     "Question", {q: "「知っている」", as: ["園長", "お姉さん"]}],

    ["filler",
    "DashedSentence", {s: "+ どのマネージャーが そのギタリストに ボーカリストが 居酒屋で 音楽論を 語っていたと 知っているの？"},
     "Question", {q: "「知っている」", as: ["マネージャー", "ボーカリスト"]}],

    ["filler",
    "DashedSentence", {s: "+ どのアシスタントが そのプロデューサーに キャスターが スタジオで プレゼントを あげたか 知っているの？"},
     "Question", {q: "「知っている」", as: ["アシスタント", "キャスター"]}],

    ["filler",
    "DashedSentence", {s: "+ どの市議会議員が その市民に 議長が 会議室で 退室を 命じたか 知っているの？"},
     "Question", {q: "「知っている」", as: ["市議会議員", "議長"]}],

    ["filler",
    "DashedSentence", {s: "+ その飼育員が トラが ケージで 赤ちゃんを 育てているか 園長に 聞いた。"},
     "Question", {q: "「聞く」", as: ["飼育員", "トラ"]}],

    ["filler",
    "DashedSentence", {s: "+ その技師が 主任が 職員室で ゴミを 集めていたか 職員に 聞いた。"},
     "Question", {q: "「聞く」", as: ["技師", "主任"]}],
];
/////////////////////////////////////

/////////////////////////////////////
// 結果送信中の呈示メッセージ

var sendingResultsMessage = "結果を送信中です";
var completionMessage = "結果が送信されました。これにて実験は全て終了です。ご協力いただきありがとうございました。このをウィンドウを閉じて終了してください。";
/////////////////////////////////////
